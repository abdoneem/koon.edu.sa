const res = await fetch("https://koon.edu.sa/")
const html = await res.text()
const urls = new Set()
for (const m of html.matchAll(/https?:\/\/[^"'>\s]+\.(png|svg|jpg|jpeg|webp)/gi)) {
  urls.add(m[0])
}
for (const m of html.matchAll(/\/wp-content\/[^"'>\s]+\.(png|svg|jpg|jpeg|webp)/gi)) {
  urls.add("https://koon.edu.sa" + m[0])
}
const logoish = [...urls].filter(
  (u) =>
    /logo|koon|brand|header|site-?icon/i.test(u) || /uploads\/20/.test(u),
)
console.log("Logo candidates:\n", logoish.join("\n") || "(none)")
console.log("\nAll (first 50):\n", [...urls].slice(0, 50).join("\n"))
