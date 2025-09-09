import { render, screen } from "@testing-library/react"

import Home from "@/app/page"

describe("src/app/page.tsx", () => {
  it("should render ok", () => {
    render(<Home />)

    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument()
  })
})
