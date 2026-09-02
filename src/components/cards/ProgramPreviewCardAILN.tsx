"use client";
import type { ProgramPreviewMock } from "@/mock-data/explore";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Same stripe technique as ProjectJumpBackInCardAILN, kept in sync visually.
const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 10px)",
};

export default function ProgramPreviewCardAILN({
  program,
}: {
  program: ProgramPreviewMock;
}) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group overflow-hidden rounded-xl border border-dashboard-border bg-card-1 transition-shadow hover:shadow-md"
    >
      <div className="relative h-16 overflow-hidden bg-linear-to-br from-claude via-claude to-forest-deep">
        <div className="absolute inset-0" style={STRIPE_STYLE} />
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-6 mb-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-4 border-card-1 bg-white shadow-sm">
            <Image
              src={program.logo}
              alt={program.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
        <p className="truncate text-sm font-bold text-foreground">
          {program.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-dashboard-border bg-dashboard-bg px-2.5 py-0.5 text-xs font-medium text-foreground">
            {program.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            {program.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
