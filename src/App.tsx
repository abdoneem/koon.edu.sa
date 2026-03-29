import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, Route, Routes } from "react-router-dom"
import { AdminDashboard } from "./admin/AdminDashboard"
import { AdminLayout } from "./admin/AdminLayout"
import { AdminLoginPage } from "./admin/AdminLoginPage"
import { AdminRegistrationsPage } from "./admin/AdminRegistrationsPage"
import { ContentPageEditor } from "./admin/ContentPageEditor"
import { ContentPagesList } from "./admin/ContentPagesList"
import { RequireAdminAuth } from "./admin/RequireAdminAuth"
import { AboutPage } from "./pages/AboutPage"
import { AcademicsPage } from "./pages/AcademicsPage"
import { AdmissionsPage } from "./pages/AdmissionsPage"
import { ContactPage } from "./pages/ContactPage"
import { FacilitiesPage } from "./pages/FacilitiesPage"
import { HomePage } from "./pages/HomePage"
import { NewsPage } from "./pages/NewsPage"
import { RegistrationPage } from "./pages/RegistrationPage"
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
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="registrations" element={<AdminRegistrationsPage />} />
        <Route path="content-pages" element={<ContentPagesList />} />
        <Route path="content-pages/new" element={<ContentPageEditor />} />
        <Route path="content-pages/:id/edit" element={<ContentPageEditor />} />
      </Route>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/academics" element={<AcademicsPage />} />
      <Route path="/student-life" element={<StudentLifePage />} />
      <Route path="/facilities" element={<FacilitiesPage />} />
      <Route path="/admissions" element={<AdmissionsPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
