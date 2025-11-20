"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

enum Theme {
  Light = "light",
  Dark = "dark",
}

export function ThemeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = typeof window !== "undefined";

  const toggleDarkMode = () => {
    if (mounted) {
      setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
      {mounted && resolvedTheme === Theme.Dark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
