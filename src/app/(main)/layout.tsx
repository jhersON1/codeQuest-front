import { Header } from "@/components/ui/header"

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">sidebar izq</div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-24">sidebar derecho</div>
        </aside>
      </div>
    </div>
  )
}
