import { signInWithPopup, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase.js";
import { meApi, logoutApi, googleAuthApi } from "./api.js";
import useAuthStore from "./store.js";
import useStudentAnalyticsStore from "@/features/student-analytics/store.js";
import useAssessmentStore from "@/features/assessments/store.js";
import useInstructorAnalyticsStore from "@/features/instructor-analytics/store.js";
import useResourceStore from "@/features/resources/store.js";
import { getAiSummary } from "@/features/ai-config/api.js";
import { getDestinationRoute } from "@/utils/redirectByRole.js";
import { saveRememberedAccount } from "./rememberedAccounts.js";

/**
 * Executes a blocking Promise.all pipeline that pre-fetches and populates
 * ALL required initial app data into global stores before navigating to dashboard.
 */
export async function bootstrapAppData(initialUser, onProgress) {
  onProgress?.("Validating user session and permissions...", 25);

  // 1. Fetch fresh user profile from /auth/me to verify session cookie
  const mePromise = meApi()
    .then((res) => {
      const freshUser = res.data?.user || initialUser;
      useAuthStore.setState({ user: freshUser });
      return freshUser;
    })
    .catch((err) => {
      if (initialUser?.role) {
        useAuthStore.setState({ user: initialUser });
        return initialUser;
      }
      throw err;
    });

  const resolvedUser = initialUser?.role ? initialUser : await mePromise;
  const role = resolvedUser?.role;

  // 2. Assemble role-specific pre-fetch promises
  const prefetchPromises = [mePromise];

  if (role === "student") {
    onProgress?.("Pre-fetching student assessments and performance metrics...", 55);
    prefetchPromises.push(
      useStudentAnalyticsStore.getState().fetchStudentDashboardData()
    );
  } else if (role === "instructor") {
    onProgress?.("Pre-fetching instructor assessments, resources, and analytics...", 55);
    prefetchPromises.push(
      useAssessmentStore.getState().getInstructorAssessments(false),
      useInstructorAnalyticsStore.getState().getInstructorOverview(false),
      useResourceStore.getState().fetchResources().catch(() => {})
    );
  } else if (role === "admin") {
    onProgress?.("Pre-fetching user directory and administration data...", 55);
    prefetchPromises.push(
      useAuthStore.getState().fetchAndCacheUsers()
    );
  } else if (role === "super_admin") {
    onProgress?.("Pre-fetching system control configurations and user directory...", 55);
    prefetchPromises.push(
      useAuthStore.getState().fetchAndCacheUsers(),
      getAiSummary()
        .then((res) => {
          if (res?.summary) {
            useAuthStore.setState({ aiSummary: res.summary });
          }
        })
        .catch(() => {})
    );
  }

  // 3. Block until ALL pre-fetch promises resolve 100%
  const [freshUser] = await Promise.all(prefetchPromises);
  const finalUser = freshUser || resolvedUser;

  onProgress?.("Hydrating workspace state...", 85);

  // 4. Mark store state as fully bootstrapped & hydrated
  useAuthStore.setState({ user: finalUser, isBootstrapped: true });

  // 5. Synchronize localStorage auth-storage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          state: { user: finalUser },
          version: 0,
        })
      );
    } catch {
      // Ignore localStorage quota/private mode errors
    }
  }

  onProgress?.("Workspace loaded! Launching dashboard...", 100);

  return { user: finalUser, role: finalUser?.role };
}

/**
 * Clears any partial session on error or abort.
 */
export async function clearPartialSession() {
  try {
    await logoutApi();
  } catch {
    // Ignore network failure when clearing session
  }
  useAuthStore.setState({
    user: null,
    isBootstrapped: false,
    cachedUsers: [],
    hasLoadedUsers: false,
    aiSummary: null,
  });
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth-storage");
    } catch {
      // Ignore
    }
  }
}

/**
 * Unified Google Auth pipeline orchestrator.
 * Handles popup or redirect token acquisition, server session exchange,
 * blocking data bootstrap, and final navigation.
 */
export async function executeGoogleAuthBootstrap({
  mode = "popup",
  router,
  onStepChange,
  onProgress,
}) {
  onStepChange?.("Connecting to Google authentication...");
  onProgress?.(15);

  let idToken = null;
  let photo = null;

  if (mode === "popup") {
    if (!auth) {
      throw new Error(
        "Google sign-in is not configured. Please set up Firebase environment variables."
      );
    }
    const result = await signInWithPopup(auth, googleProvider);
    if (!result?.user) {
      throw new Error("No user returned from Google sign-in.");
    }
    photo = result.user.photoURL;
    idToken = await result.user.getIdToken();
  } else if (mode === "redirect") {
    if (!auth) return null;
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    photo = result.user.photoURL;
    idToken = await result.user.getIdToken();
  }

  onStepChange?.("Verifying Google credentials with Gradewise...");
  onProgress?.(35);

  const authResponse = await googleAuthApi({ idToken });
  const initialUser = authResponse.data?.user;
  if (!initialUser) {
    throw new Error(
      authResponse.data?.message || "Failed to authenticate session with server."
    );
  }

  if (photo && !initialUser.avatar) {
    initialUser.avatar = photo;
  }

  // Pre-seed user in auth store and remember verified account
  useAuthStore.setState({ user: initialUser });
  saveRememberedAccount(initialUser);

  // Pre-fetch destination route chunks
  const destination = getDestinationRoute(initialUser.role);
  if (router?.prefetch) {
    router.prefetch(destination);
  }

  // Navigate immediately so the UI transitions straight to dashboard without delay
  if (router) {
    router.replace(destination);
  }

  // Pre-fetch workspace data silently in background without blocking the UI
  bootstrapAppData(initialUser, (msg, pct) => {
    onStepChange?.(msg);
    onProgress?.(pct);
  }).catch((err) => {
    console.warn("Background data prefetch warning:", err);
  });

  return initialUser;
}


