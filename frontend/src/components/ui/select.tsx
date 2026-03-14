import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id?: string;
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
};

export function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm",
          "outline-none transition-all duration-200 cursor-pointer appearance-none",
          "focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]",
          !value && "text-gray-400",
          value && "text-gray-900",
          error && "border-red-400 focus:border-red-400 focus:shadow-[inset_0_0_0_1px_#ef4444]",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
