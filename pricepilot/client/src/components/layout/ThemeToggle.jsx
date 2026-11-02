import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("pricepilot-theme") || "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pricepilot-theme", theme);
  }, [theme]);
  return <button className="pp-icon-button" type="button" title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-label="Toggle theme" onClick={() => setTheme(v => v === "dark" ? "light" : "dark")}>
    {theme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}
  </button>;
}