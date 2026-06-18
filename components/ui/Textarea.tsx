import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, required, rows = 3, style, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-brown">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-[var(--radius-xl)] border border-white/[0.12] bg-white/[0.06] px-3 py-2.5 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-terracotta/70 focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40 resize-none",
            error && "border-danger/60 focus:border-danger/80 focus:ring-danger/40",
            className,
          )}
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", ...style }}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
