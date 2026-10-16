"use client";
import { useState, useEffect } from "react";

let isGloballyHydrated = false;

export default function useHydrated() {
  const [hydrated, setHydrated] = useState(() => isGloballyHydrated);

  useEffect(() => {
    isGloballyHydrated = true;
    setHydrated(true);
  }, []);

  return hydrated;
}

