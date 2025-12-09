"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, type LucideIcon } from "lucide-react";

type MetricColor = "blue" | "green" | "gray" | "purple";

const colorClasses: Record<MetricColor, { bg: string; icon: string; text: string }> = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    text: "text-green-700",
  },
  gray: {
    bg: "bg-gray-100",
    icon: "text-gray-500",
    text: "text-gray-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    text: "text-purple-700",
  },
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: MetricColor;
  isLoading?: boolean;
}

export function MetricCard({ title, value, icon: Icon, color, isLoading }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorClasses[color];

  useEffect(() => {
    if (isLoading) return;

    let start = 0;
    const end = value;
    const duration = 800;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className={cn("p-3 rounded-xl w-fit", colors.bg)}>
        <Icon className={cn("h-6 w-6", colors.icon)} />
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        ) : (
          <div className={cn("text-3xl font-bold", colors.text)}>
            {displayValue.toLocaleString()}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}
