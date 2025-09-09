import "@testing-library/jest-dom"

import { mswServer } from "./src/config/msw/mswServer"
jest.mock("next/navigation", () => require("next-router-mock/navigation"))

Object.defineProperty(document, "elementFromPoint", {
  value: () => document.createElement("div"),
  writable: true,
})

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

window.HTMLElement.prototype.scrollIntoView = function () {}

// To prevent Navigation in test
HTMLAnchorElement.prototype.click = jest.fn()

// Download file
const createObjectURLMock = jest.fn(() => "blob:fake-url")
global.URL.createObjectURL = createObjectURLMock
global.URL.revokeObjectURL = jest.fn()

beforeAll(() => {
  mswServer.listen()

  const tooltipRoot = document.createElement("div")
  tooltipRoot.setAttribute("id", "tooltip")
  document.body.appendChild(tooltipRoot)

  // prevent log error navigation https://jestjs.io/blog/2025/06/04/jest-30#known-issues
  const originalConsoleError = console.error

  jest.spyOn(console, "error").mockImplementation((...args) => {
    const message = args.map(String).join(" ")
    if (message.includes("navigation")) {
      return
    }
    originalConsoleError(...args)
  })
})

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  mswServer.close()
})

afterEach(() => {
  mswServer.resetHandlers()
})
