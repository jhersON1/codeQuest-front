const { TextDecoder, TextEncoder } = require("node:util")
const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web")

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
  WritableStream: { value: WritableStream },
})

if (typeof global.MessagePort === "undefined") {
  class MessagePort {
    constructor() {
      this.onmessage = null
    }
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
  global.MessagePort = MessagePort
}

if (typeof global.MessageChannel === "undefined") {
  class MessageChannel {
    constructor() {
      this.port1 = new global.MessagePort()
      this.port2 = new global.MessagePort()
    }
  }
  global.MessageChannel = MessageChannel
}

if (typeof global.BroadcastChannel === "undefined") {
  class BroadcastChannel {
    constructor(name) {
      this.name = name
    }
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
  global.BroadcastChannel = BroadcastChannel
}

const { Blob, File } = require("node:buffer")
const { fetch, Headers, FormData, Request, Response } = require("undici")

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true, configurable: true },
  Blob: { value: Blob, configurable: true },
  File: { value: File, configurable: true },
  Headers: { value: Headers, configurable: true },
  FormData: { value: FormData, configurable: true },
  Request: { value: Request, configurable: true },
  Response: { value: Response, configurable: true },
})

const { webcrypto } = require("node:crypto")
const { performance } = require("node:perf_hooks")
const { URL, URLSearchParams } = require("node:url")

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true })
}
if (!globalThis.performance) {
  Object.defineProperty(globalThis, "performance", { value: performance, configurable: true })
}
if (!globalThis.URL) {
  Object.defineProperty(globalThis, "URL", { value: URL, configurable: true })
}
if (!globalThis.URLSearchParams) {
  Object.defineProperty(globalThis, "URLSearchParams", {
    value: URLSearchParams,
    configurable: true,
  })
}
