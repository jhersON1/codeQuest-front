import { type HTMLAttributes } from "react"

export type SVGIcon = React.FC<
  HTMLAttributes<SVGElement> & {
    width?: number | string
    height?: number | string
    fill?: string
  }
>
