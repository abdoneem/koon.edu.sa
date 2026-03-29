const TOKEN_KEY = "koon_admin_token"

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}
