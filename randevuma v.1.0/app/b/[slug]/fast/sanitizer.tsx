"use client";
import { useEffect } from "react";

export function HydrationSanitizer() {
  useEffect(() => {
    const badAttrs = Array.from(document.body.attributes)
      .map(a => a.name)
      .filter(n => n.startsWith("bis_") || n.startsWith("data-bis") || n === "bis_register" || n.includes("__processed"));
    badAttrs.forEach(n => document.body.removeAttribute(n));
  }, []);
  return null;
}


