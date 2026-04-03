import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./i18n/config"
import "./index.css"
import "./styles/home-premium.css"
import { koonMantineTheme } from "./theme/koonMantineTheme"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={koonMantineTheme} defaultColorScheme="light">
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
