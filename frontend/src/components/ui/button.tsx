"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-forest text-white hover:bg-forest-dark shadow-sm",
  secondary: "bg-white text-forest border border-forest hover:bg-sand",
  ghost: "bg-transparent text-forest hover:bg-leaf/10",
};

export function Button({
  variant = "primary",
  className,
  children,
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
