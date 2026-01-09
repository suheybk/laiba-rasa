import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, icon, ...props }, ref) => {
        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border-2 bg-slate-900/50 px-4 py-2 text-base text-white placeholder:text-slate-500",
                        "border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
                        "transition-all duration-200",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        icon && "pl-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
