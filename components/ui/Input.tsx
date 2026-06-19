import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, required, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-brown">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "min-h-[44px] w-full rounded-[var(--radius-xl)] border border-border bg-white/[0.06] px-3 py-2.5 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-terracotta/70 focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-danger/60 focus:border-danger/80 focus:ring-danger/40",
            className,
          )}
          style={style}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
