"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}> 
      <SunMedium className="h-4 w-4 dark:hidden" />
      <MoonStar className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
