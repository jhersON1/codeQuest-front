export default {
  "**/*.ts?(x)": () => "npm run type-check",
  "**/*.{ts,js}?(x)": (filenames) => {
    const quoted = filenames.map((f) => `"${f}"`).join(" ")
    return [`npm run format:fix -- ${quoted}`, `npm run lint -- ${quoted}`]
  },
}
