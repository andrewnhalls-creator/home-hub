import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <label htmlFor={checkboxId} className="flex items-center gap-2 text-sm font-medium text-brown">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "h-5 w-5 rounded-md border border-border text-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta",
            className,
          )}
          {...props}
        />
        {label}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
