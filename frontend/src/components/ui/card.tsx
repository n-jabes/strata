"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({
  title,
  description,
  children,
  className,
  hover = false,
}: CardProps) {
  const Wrapper = hover ? motion.div : "div";
  const hoverProps = hover
    ? { whileHover: { y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" } }
    : {};

  return (
    <Wrapper
      className={cn("rounded-2xl bg-white shadow-md p-6", className)}
      {...hoverProps}
      transition={{ duration: 0.2 }}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {children}
    </Wrapper>
  );
}
