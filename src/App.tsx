import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, Route, Routes } from "react-router-dom"
import { AboutPage } from "./pages/AboutPage"
import { AcademicsPage } from "./pages/AcademicsPage"
import { AdmissionsPage } from "./pages/AdmissionsPage"
import { ContactPage } from "./pages/ContactPage"
import { FacilitiesPage } from "./pages/FacilitiesPage"
import { HomePage } from "./pages/HomePage"
import { NewsPage } from "./pages/NewsPage"
import { StudentLifePage } from "./pages/StudentLifePage"

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const isArabic = i18n.language.startsWith("ar")
    document.documentElement.lang = isArabic ? "ar" : "en"
    document.documentElement.dir = isArabic ? "rtl" : "ltr"
  }, [i18n.language])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/academics" element={<AcademicsPage />} />
      <Route path="/student-life" element={<StudentLifePage />} />
      <Route path="/facilities" element={<FacilitiesPage />} />
      <Route path="/admissions" element={<AdmissionsPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
