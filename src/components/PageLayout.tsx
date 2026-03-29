import type { ReactNode } from "react"
import { Footer } from "./Footer"
import { Header } from "./Header"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
