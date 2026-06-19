import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, id, required, style, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-brown">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "min-h-[44px] w-full appearance-none rounded-[var(--radius-xl)] border border-border bg-white/[0.06] px-3 py-2.5 pr-10 text-sm text-brown transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-terracotta/70 focus:ring-1 focus:ring-terracotta/50 disabled:cursor-not-allowed disabled:opacity-40 [color-scheme:dark]",
              error && "border-danger/60 focus:border-danger/80 focus:ring-danger/40",
              className,
            )}
            style={style}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0D0B1F] text-brown">
                {option.label}
              </option>
            ))}
          </select>
          <CaretDown
            weight="bold"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </div>
        {error && (
          <p id={errorId} className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
