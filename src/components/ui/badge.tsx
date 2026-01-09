"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "premium";
    size?: "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        const variantStyles = {
            default: "bg-slate-700 text-slate-200 border-slate-600",
            success: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
            warning: "bg-amber-900/50 text-amber-300 border-amber-700/50",
            error: "bg-red-900/50 text-red-300 border-red-700/50",
            info: "bg-blue-900/50 text-blue-300 border-blue-700/50",
            premium: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50",
        };

        const sizeStyles = {
            sm: "px-2 py-0.5 text-xs",
            md: "px-2.5 py-1 text-sm",
            lg: "px-3 py-1.5 text-base",
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border font-medium",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
