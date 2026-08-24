"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Soft floral Blumi brand colors
const navItems = [
  {
    name: "Discover",
    href: "/discover",
    gradient: "bg-gradient-to-tr from-pink-300 to-rose-400",
    borderColor: "border-pink-200 group-hover:border-pink-300",
    glow: "group-hover:shadow-[0_0_12px_rgba(244,114,182,0.4)]"
  },
  {
    name: "Community",
    href: "/community",
    gradient: "bg-gradient-to-tr from-fuchsia-300 to-purple-400",
    borderColor: "border-fuchsia-200 group-hover:border-fuchsia-300",
    glow: "group-hover:shadow-[0_0_12px_rgba(192,38,211,0.4)]"
  },
  {
    name: "About",
    href: "/about",
    gradient: "bg-gradient-to-tr from-orange-200 to-pink-300",
    borderColor: "border-orange-200 group-hover:border-orange-300",
    glow: "group-hover:shadow-[0_0_12px_rgba(251,146,60,0.4)]"
  }
];

export default function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isAnyHovered = hoveredIndex !== null;

  return (
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <motion.div 
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        className="flex items-center gap-1.5"
      >
        {navItems.map((item, idx) => {
          const isHovered = hoveredIndex === idx;

          return (
            <motion.div
              layout // Enables buttery FLIP animations for sibling displacement
              key={item.name}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                // Shrunk idle width from 1.25rem (20px) to 1rem (16px)
                width: isHovered ? "max-content" : "1rem",
                borderRadius: 9999, // Explicitly maintains a perfect pill shape during layout scale
              }}
              animate={{ y: isAnyHovered ? 0 : [0, -3, 0] }}
              transition={{
                layout: { type: "spring", stiffness: 400, damping: 30 },
                y: isAnyHovered
                  ? { type: "spring", stiffness: 400, damping: 30 } 
                  : {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 5,
                      delay: idx * 0.15,
                      ease: "easeInOut",
                    },
              }}
              className={cn(
                // Shrunk height from h-5 (20px) to h-4 (16px)
                "group relative flex h-4 items-center justify-center overflow-hidden border bg-white shadow-sm transition-colors duration-300",
                item.borderColor,
                item.glow
              )}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex h-full w-full items-center justify-center outline-none",
                  // Tightened padding slightly to match the smaller height
                  isHovered ? "px-2.5" : "px-0"
                )}
              >
                {/* Inner Glowing Gradient */}
                <motion.div
                  className={cn("absolute inset-0 rounded-full", item.gradient)}
                  animate={{
                    opacity: isHovered ? 1 : isAnyHovered ? 0.15 : [0.3, 0.8, 0.3],
                  }}
                  transition={
                    isAnyHovered
                      ? { duration: 0.2 }
                      : {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 5,
                          delay: idx * 0.15,
                          ease: "easeInOut",
                        }
                  }
                />

                {/* Text only animates opacity and a tiny horizontal slide */}
                <motion.span
                  layout // Prevents text stretching during the parent's layout scale
                  initial={false}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : -3, // Shrunk the slide slightly to match the new size
                  }}
                  transition={{ duration: 0.2, delay: isHovered ? 0.05 : 0 }}
                  // Adjusted font size and tracking for crisp readability at the smaller scale
                  className="relative z-10 whitespace-nowrap text-[9px] tracking-wide font-bold text-gray-800"
                >
                  {item.name}
                </motion.span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}