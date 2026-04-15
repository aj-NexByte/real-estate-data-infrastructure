import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel", className)}>{children}</div>;
}
