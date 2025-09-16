import { render, screen } from "@testing-library/react"

import Home from "@/app/(main)/page"

describe("src/app/page.tsx", () => {
  it("should render ok", () => {
    render(<Home />)
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument()
  })
})
