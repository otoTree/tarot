"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export function LanguageInit() {
  const setLanguage = useStore((state) => state.setLanguage);

  useEffect(() => {
    // Check if we have already performed the initial language detection
    const hasDetected = localStorage.getItem('language-detected');
    
    if (!hasDetected) {
      // Get browser language
      const browserLang = navigator.language.toLowerCase();
      
      // If browser language is Chinese (zh, zh-CN, zh-TW, etc.), switch to Chinese
      if (browserLang.startsWith('zh')) {
        setLanguage('zh');
      } else {
        setLanguage('en');
      }
      
      // Mark as detected so we don't override user preference later
      localStorage.setItem('language-detected', 'true');
    }
  }, [setLanguage]);

  return null;
}
