import { setupWorker } from "msw/browser"

import { handlers } from "@/config/msw/mocks/handlers"

export const mswWorker = setupWorker(...handlers)
