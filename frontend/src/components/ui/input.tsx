import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
          "outline-none transition-all duration-200",
          "focus:border-forest focus:shadow-[inset_0_0_0_1px_#007E6E]",
          error && "border-red-400 focus:border-red-400 focus:shadow-[inset_0_0_0_1px_#ef4444]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
