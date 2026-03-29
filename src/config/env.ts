const required = (key: "VITE_API_BASE_URL") => {
  const value = import.meta.env[key]
  return value ?? ""
}

export const env = {
  apiBaseUrl: required("VITE_API_BASE_URL"),
}
