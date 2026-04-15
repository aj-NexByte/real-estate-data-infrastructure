import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20",
        props.className
      )}
    />
  );
}
