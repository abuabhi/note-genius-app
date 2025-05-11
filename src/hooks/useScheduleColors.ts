
import { useState, useEffect } from "react";

interface ScheduleColor {
  label: string;
  value: string;
}

export function useScheduleColors() {
  // Predefined color palette for events
  const defaultColors: ScheduleColor[] = [
    { label: "Blue", value: "#3b82f6" },
    { label: "Green", value: "#10b981" },
    { label: "Red", value: "#ef4444" },
    { label: "Yellow", value: "#f59e0b" },
    { label: "Purple", value: "#8b5cf6" },
    { label: "Pink", value: "#ec4899" },
    { label: "Indigo", value: "#6366f1" },
    { label: "Teal", value: "#14b8a6" },
    { label: "Orange", value: "#f97316" },
    { label: "Cyan", value: "#06b6d4" }
  ];

  const [scheduleColors, setScheduleColors] = useState<ScheduleColor[]>(defaultColors);

  return { scheduleColors, setScheduleColors };
}
