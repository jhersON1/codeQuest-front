import { PostCard } from "@/features/post/post-card"

const posts = [
  {
    id: 1,
    title: "¿Cuál es la mejor manera de optimizar React para producción?",
    content:
      "Estoy trabajando en una aplicación React grande y necesito consejos sobre optimización...",
    author: "u/devmaster",
    community: "r/react",
    upvotes: 245,
    comments: 67,
    timeAgo: "hace 3 horas",
    image: null,
  },
  {
    id: 2,
    title: "Mi setup de desarrollo 2024 - Full Stack Developer",
    content:
      "Después de años programando, este es mi setup actual que me ayuda a ser más productivo...",
    author: "u/fullstackdev",
    community: "r/programming",
    upvotes: 892,
    comments: 156,
    timeAgo: "hace 8 horas",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/modern-developer-setup-with-multiple-monitors-GHgAtvDRaZ7i75C5CZvlfyfLd2a3UY.jpg",
  },
  {
    id: 3,
    title: "Tutorial: Cómo implementar autenticación JWT en Next.js 14",
    content: "Una guía completa paso a paso para implementar autenticación segura...",
    author: "u/nextjsexpert",
    community: "r/nextjs",
    upvotes: 567,
    comments: 89,
    timeAgo: "hace 12 horas",
    image: null,
  },
  {
    id: 4,
    title: "¿TypeScript vs JavaScript en 2024? Mi experiencia después de 2 años",
    content:
      "Hace dos años decidí migrar completamente a TypeScript. Aquí están mis conclusiones...",
    author: "u/typescriptfan",
    community: "r/typescript",
    upvotes: 1234,
    comments: 234,
    timeAgo: "hace 1 día",
    image: null,
  },
]

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inicio</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Mejor
          </button>
          <button className="rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Nuevo
          </button>
          <button className="rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Top
          </button>
        </div>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
