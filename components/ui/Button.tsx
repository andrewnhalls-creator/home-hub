import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta text-white shadow-[var(--shadow-btn)] hover:brightness-95 enabled:active:translate-y-px enabled:active:shadow-[var(--shadow-btn-active)] focus-visible:ring-terracotta",
  secondary:
    "bg-transparent border border-terracotta text-terracotta hover:bg-terracotta/10 enabled:active:scale-[0.97] focus-visible:ring-terracotta",
  danger:
    "bg-transparent border border-danger text-danger hover:bg-danger/10 enabled:active:scale-[0.97] focus-visible:ring-danger",
  ghost: "bg-transparent text-brown hover:bg-sand enabled:active:scale-[0.97] focus-visible:ring-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[44px] px-3 py-2 text-sm",
  md: "min-h-[44px] px-4 py-3 text-sm",
  lg: "min-h-[52px] px-6 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[box-shadow,transform,filter] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
