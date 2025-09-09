import { setupServer } from "msw/node"

import { handlers } from "@/config/msw/mocks/handlers"

export const mswServer = setupServer(...handlers)
