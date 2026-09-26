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
        return parsed;
      }
    }

    // Fallback: check if previous user exists in auth-storage
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      const user = parsedAuth?.state?.user;
      if (user?.email) {
        const initialAccount = {
          name: user.name || user.displayName || user.email.split("@")[0],
          email: user.email,
          avatar: user.avatar || user.photoURL || null,
          role: user.role || "student",
          provider: "google",
          lastLogin: Date.now(),
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

    const newAccount = {
      name: displayName,
      email: user.email,
      avatar: user.avatar || user.photoURL || null,
      role: user.role || "student",
      provider: user.provider || "google",
      lastLogin: Date.now(),
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
