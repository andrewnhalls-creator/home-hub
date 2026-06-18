import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@phosphor-icons/react/dist/ssr";
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
    "bg-terracotta text-cream border border-transparent shadow-[var(--shadow-btn)] hover:bg-coral enabled:active:translate-y-px enabled:active:shadow-[var(--shadow-btn-active)] focus-visible:ring-terracotta/50",
  secondary:
    "bg-white/[0.07] text-terracotta border border-terracotta/40 shadow-[var(--shadow-xs)] hover:bg-white/[0.12] enabled:active:scale-[0.97] focus-visible:ring-terracotta/50",
  danger:
    "bg-danger/90 text-white border border-transparent shadow-[var(--shadow-btn)] hover:bg-danger enabled:active:scale-[0.97] focus-visible:ring-danger/50",
  ghost:
    "bg-transparent text-brown border border-transparent hover:bg-white/[0.08] enabled:active:scale-[0.97] focus-visible:ring-muted/50",
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
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-xl)] font-medium transition-[background,box-shadow,transform,filter] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-40",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
