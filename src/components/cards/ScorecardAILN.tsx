import { ReactNode } from "react";

interface ScorecardAILNProps {
 title: string;
 value: string | number;
 unit?: string;
 /** Footer content rendered in a divided zone at the bottom of the card. */
 children?: ReactNode;
}

export default function ScorecardAILN({
 title,
 value,
 unit,
 children,
}: ScorecardAILNProps) {
 return (
 <div className="ailn-card flex min-h-40 flex-col overflow-hidden">
 <div className="flex flex-1 flex-col p-5">
 <div className="text-xs font-medium text-muted-foreground">
 {title}
 </div>

 <div className="mt-3 flex items-baseline gap-1.5">
 <span className=" text-4xl font-bold leading-none tracking-tight text-foreground">
 {value}
 </span>
 {unit && (
 <span className="text-sm font-medium text-muted-foreground">
 {unit}
 </span>
 )}
 </div>
 </div>

 {children && (
 <div className="border-t border-border px-5 py-3 ">
 {children}
 </div>
 )}
 </div>
 );
}
