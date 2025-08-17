import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useThemeContext } from "@/contexts/ThemeContext"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, savePreferences, saving } = useThemeContext()

  const handleThemeChange = async (newTheme: string) => {
    console.log('🎨 ThemeToggle: Mudando tema para:', newTheme)
    console.log('🎨 ThemeToggle: Tema atual:', theme)
    console.log('🎨 ThemeToggle: Classes do HTML antes:', document.documentElement.classList.toString())
    
    setTheme(newTheme)
    
    // Verificar se a mudança foi aplicada
    setTimeout(() => {
      console.log('🎨 ThemeToggle: Classes do HTML depois:', document.documentElement.classList.toString())
      console.log('🎨 ThemeToggle: Background atual:', getComputedStyle(document.documentElement).getPropertyValue('--background'))
    }, 100)
    
    // Auto save theme preference
    try {
      await savePreferences()
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          disabled={saving}
          className="h-9 w-9"
        >
          {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {(theme === 'system' || !theme) && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}