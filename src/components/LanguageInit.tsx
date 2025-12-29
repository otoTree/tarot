"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export function LanguageInit() {
  const setLanguage = useStore((state) => state.setLanguage);

  useEffect(() => {
    // Check if user has a saved preference (optional, if you persist state)
    // For now, we just check browser language on first load if store is default
    
    const browserLang = navigator.language;
    if (browserLang.toLowerCase().startsWith('zh')) {
      setLanguage('zh');
    } else {
      setLanguage('en');
    }
  }, [setLanguage]);

  return null;
}
