"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";

type FeatureCardProps = {
  icon: IconType;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white shadow-md p-6 h-full flex flex-col gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-forest" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
