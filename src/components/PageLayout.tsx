import type { ReactNode } from "react"
import { ChatbotFab } from "./ChatbotFab"
import Footer from "./Footer"
import { Header } from "./Header"
import { LaunchAnnouncementModal } from "./LaunchAnnouncementModal"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <LaunchAnnouncementModal />
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatbotFab />
    </>
  )
}
