"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      const swUrl = "/sw.js";
      navigator.serviceWorker
        .register(swUrl)
        .catch(() => {
          // no-op: registration failures are non-critical for initial load
        });
    }
  }, []);

  return null;
}



