import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, "..", "public", "brand")

const files = [
  ["https://koon.edu.sa/wp-content/uploads/2025/07/logo_H.png", "koon-logo-h.png"],
  ["https://koon.edu.sa/wp-content/uploads/2025/07/fav.png", "koon-favicon-src.png"],
]

await fs.promises.mkdir(outDir, { recursive: true })
for (const [url, name] of files) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.promises.writeFile(path.join(outDir, name), buf)
  console.log("Wrote", name, buf.length, "bytes")
}
