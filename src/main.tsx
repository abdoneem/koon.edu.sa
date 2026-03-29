import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./i18n/config"
import "./index.css"
import { koonMantineTheme } from "./theme/koonMantineTheme"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={koonMantineTheme} defaultColorScheme="light">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
