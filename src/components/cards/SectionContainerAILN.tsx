"use client";
import React from "react";

interface SectionContainerAILNProps {
  title: string;
  desc?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export default function SectionContainerAILN(props: SectionContainerAILNProps) {
  return (
    <section
      className={`ailn-card flex flex-col p-5 border bg-card-1 ${props.className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-bold text-foreground">{props.title}</h2>
          {props.desc && (
            <p className="text-sm text-muted-foreground">{props.desc}</p>
          )}
        </div>
        {props.headerRight && (
          <div className="shrink-0">{props.headerRight}</div>
        )}
      </div>
      <div className={`mt-5 flex-1 ${props.contentClassName ?? ""}`}>
        {props.children}
      </div>
    </section>
  );
}
