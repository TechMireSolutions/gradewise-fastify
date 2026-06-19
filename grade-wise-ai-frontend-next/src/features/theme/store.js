import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "system",

      setTheme: (theme) => {
        if (theme !== "light" && theme !== "dark" && theme !== "system") return;
        set({ theme });
      },

      toggleTheme: () => {
        const { theme } = get();
        const resolved =
          theme === "system"
            ? typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : theme;
        set({ theme: resolved === "dark" ? "light" : "dark" });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
