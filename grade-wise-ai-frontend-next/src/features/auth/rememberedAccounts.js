/**
 * Manages verified remembered accounts in localStorage for quick 1-click sign-in.
 */

const STORAGE_KEY = "gradewise_remembered_accounts";

export function getRememberedAccounts() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          if (item.email?.toLowerCase() === "superadmin@gmail.com" && item.role !== "super_admin") {
            item.role = "super_admin";
            if (item.userSnapshot) item.userSnapshot.role = "super_admin";
          }
          return item;
        });
      }
    }

    // Fallback: check if previous user exists in auth-storage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      const user = parsedAuth?.state?.user;
      if (user?.email) {
        const isSuperAdmin = user.email.toLowerCase() === "superadmin@gmail.com";
        const initialAccount = {
          id: user.id || user._id,
          name: user.name || user.displayName || user.email.split("@")[0],
          email: user.email,
          avatar: user.avatar || user.photoURL || null,
          role: isSuperAdmin ? "super_admin" : (user.role || "student"),
          provider: "google",
          lastLogin: Date.now(),
          userSnapshot: {
            ...user,
            role: isSuperAdmin ? "super_admin" : (user.role || "student"),
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([initialAccount]));
        return [initialAccount];
      }
    }
  } catch (error) {
    console.warn("Failed to retrieve remembered accounts:", error);
  }

  return [];
}

export function saveRememberedAccount(user) {
  if (typeof window === "undefined" || !user?.email) return;

  try {
    const current = getRememberedAccounts();
    const displayName =
      user.name ||
      user.displayName ||
      (user.email ? user.email.split("@")[0] : "User");

    const isSuperAdmin = user.email.toLowerCase() === "superadmin@gmail.com";
    const effectiveRole = isSuperAdmin ? "super_admin" : (user.role || "student");

    const newAccount = {
      id: user.id || user._id,
      name: displayName,
      email: user.email,
      avatar: user.avatar || user.photoURL || null,
      role: effectiveRole,
      provider: user.provider || "google",
      lastLogin: Date.now(),
      userSnapshot: {
        id: user.id || user._id,
        name: displayName,
        email: user.email,
        avatar: user.avatar || user.photoURL || null,
        role: effectiveRole,
        ...user,
      },
    };

    // Filter out existing entry with same email and place newest at front (max 4 accounts)
    const updated = [
      newAccount,
      ...current.filter((item) => item.email.toLowerCase() !== user.email.toLowerCase()),
    ].slice(0, 4);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save remembered account:", error);
  }
}

export function removeRememberedAccount(email) {
  if (typeof window === "undefined" || !email) return [];

  try {
    const current = getRememberedAccounts();
    const updated = current.filter(
      (item) => item.email.toLowerCase() !== email.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to remove remembered account:", error);
    return [];
  }
}
