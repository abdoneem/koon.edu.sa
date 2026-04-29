const required = (key: "VITE_API_BASE_URL") => {
  const value = import.meta.env[key]
  return value ?? ""
}

const apiBaseUrl = required("VITE_API_BASE_URL")

if (import.meta.env.DEV && !apiBaseUrl.trim()) {
  // eslint-disable-next-line no-console
  console.warn(
    "[env] VITE_API_BASE_URL is empty. Copy .env.example to .env.local and set the Laravel URL (e.g. http://127.0.0.1:8001), then restart Vite. " +
      "If vite.config.ts proxies /api to Laravel, relative /api calls may still work.",
  )
}

export const env = {
  apiBaseUrl,
}
