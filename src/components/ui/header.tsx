import { Search, Plus, MessageSquare, Bell, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <span className="text-lg font-bold text-primary-foreground">CQ</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">CodeQuest</span>
          </div>
        </div>

        <div className="mx-8 hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Buscar en CodeQuest..."
              className="rounded-full border-border/50 bg-muted/50 py-3 pr-4 pl-12 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="border-english-violet/50 bg-dark-purple/30 text-white transition-all duration-200 hover:bg-dark-purple/50"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
