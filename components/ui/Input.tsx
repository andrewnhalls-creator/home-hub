import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  /** Optional leading icon rendered inside the field. */
  icon?: Icon;
  /** Optional trailing slot inside the field (e.g. a show-password toggle). */
  endSlot?: ReactNode;
  /** Optional accessory rendered at the right end of the label row (e.g. a help link). */
  labelEnd?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon: LeadingIcon, endSlot, labelEnd, id, required, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-brown">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
          {labelEnd}
        </div>
        <div className="relative">
          {LeadingIcon && (
            <LeadingIcon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
            />
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "min-h-[44px] w-full rounded-[var(--radius-xl)] border border-border bg-card px-3 py-2.5 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-terracotta/70 focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40",
              LeadingIcon && "pl-10",
              endSlot != null && "pr-12",
              error && "border-danger/60 focus:border-danger/80 focus:ring-danger/40",
              className,
            )}
            style={style}
            {...props}
          />
          {endSlot != null && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{endSlot}</div>
          )}
        </div>
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
