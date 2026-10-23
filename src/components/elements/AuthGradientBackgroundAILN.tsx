"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { GradientASCIIProps } from "@/components/elements/GradientASCIIAILN";

const GradientASCII = dynamic<GradientASCIIProps>(
  () => import("./GradientASCIIAILN.js").then((module) => module.GradientASCIIAILN),
  { ssr: false },
);
const DESKTOP_QUERY = "(min-width: 1024px)";
const AUTH_COLORS = [
  "var(--claude)",
  "var(--hijau)",
  "var(--lime-bright)",
  "var(--hijau-t)",
];

function subscribe(callback: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;
const getServerSnapshot = () => false;

export default function AuthGradientBackgroundAILN() {
  const desktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,var(--claude),var(--forest-deep)_70%)]"
    >
      {desktop && (
        <GradientASCII
          colors={AUTH_COLORS}
          shape="horizon"
          cellSize={16}
          speed={0.6}
          grain={0.05}
          glow={0.15}
          dpr={1.5}
        />
      )}
    </div>
  );
}
