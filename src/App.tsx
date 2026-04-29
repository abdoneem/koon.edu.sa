import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Route, Routes } from "react-router-dom"
import { AdminDashboard } from "./admin/AdminDashboard"
import { AdminLayout } from "./admin/AdminLayout"
import { AdminLoginPage } from "./admin/AdminLoginPage"
import { AdminLandingArticlesPage } from "./admin/AdminLandingArticlesPage"
import { AdminBookTourPage } from "./admin/AdminBookTourPage"
import { AdminContactMessagesPage } from "./admin/AdminContactMessagesPage"
import { AdminRegistrationsPage } from "./admin/AdminRegistrationsPage"
import { AdminLandingNewsPage } from "./admin/AdminLandingNewsPage"
import { CmsPageEditor } from "./admin/CmsPageEditor"
import { CmsPagesList } from "./admin/CmsPagesList"
import { CmsSettingsPage } from "./admin/CmsSettingsPage"
import { AdminRolesPage } from "./admin/AdminRolesPage"
import { AdminUsersPage } from "./admin/AdminUsersPage"
import { ContentPageEditor } from "./admin/ContentPageEditor"
import { ContentPagesList } from "./admin/ContentPagesList"
import { RequireAdminAuth } from "./admin/RequireAdminAuth"
import { DocumentHead } from "./components/DocumentHead"
import { HomeHashRedirect } from "./components/HomeHashRedirect"
import { LegacyLocaleRedirect } from "./components/LegacyLocaleRedirect"
import { LocaleLayout } from "./components/LocaleLayout"
import { CmsSiteProvider } from "./context/CmsSiteContext"
import { InlineEditProvider } from "./context/InlineEditContext"
import { AboutPage } from "./pages/AboutPage"
import { AcademicsPage } from "./pages/AcademicsPage"
import { AdmissionsPage } from "./pages/AdmissionsPage"
import { ArticlesDetailPage } from "./pages/ArticlesDetailPage"
import { ArticlesListPage } from "./pages/ArticlesListPage"
import { ContactPage } from "./pages/ContactPage"
import { HomePage } from "./pages/HomePage"
import { NewsDetailPage } from "./pages/NewsDetailPage"
import { NewsListPage } from "./pages/NewsListPage"
import { PublicCmsPage } from "./pages/PublicCmsPage"
import RegistrationPage from "./pages/RegistrationPage"
import { StudentLifePage } from "./pages/StudentLifePage"
import type { PublicLocale } from "./i18n/localeRouting"

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const isArabic = i18n.language.startsWith("ar")
    document.documentElement.lang = isArabic ? "ar" : "en"
    document.documentElement.dir = isArabic ? "rtl" : "ltr"
  }, [i18n.language])

  return (
    <CmsSiteProvider>
      <InlineEditProvider>
        <DocumentHead />
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
          <Route path="book-tour-requests" element={<AdminBookTourPage />} />
          <Route path="contact-messages" element={<AdminContactMessagesPage />} />
          <Route path="content-pages" element={<ContentPagesList />} />
          <Route path="content-pages/new" element={<ContentPageEditor />} />
          <Route path="content-pages/:id/edit" element={<ContentPageEditor />} />
          <Route path="cms-pages" element={<CmsPagesList />} />
          <Route path="cms-pages/new" element={<CmsPageEditor />} />
          <Route path="cms-pages/:id/edit" element={<CmsPageEditor />} />
          <Route path="cms-settings" element={<CmsSettingsPage />} />
          <Route path="news" element={<AdminLandingNewsPage />} />
          <Route path="articles" element={<AdminLandingArticlesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
        </Route>
        {(["en", "ar"] as const).map((lang: PublicLocale) => (
          <Route key={lang} path={lang} element={<LocaleLayout lang={lang} />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="academics" element={<AcademicsPage />} />
            <Route path="student-life" element={<StudentLifePage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="registration" element={<RegistrationPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="why-koon" element={<HomeHashRedirect hash="why-koon" />} />
            <Route path="media" element={<HomeHashRedirect hash="media" />} />
            <Route path="book-tour" element={<HomeHashRedirect hash="book-tour" />} />
            <Route path="virtual-tour" element={<HomeHashRedirect hash="virtual-tour" />} />
            <Route path="portals" element={<HomeHashRedirect hash="portals" />} />
            <Route path="accreditations" element={<HomeHashRedirect hash="accreditations" />} />
            <Route path="excellence" element={<HomeHashRedirect hash="excellence" />} />
            <Route path="news" element={<NewsListPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />
            <Route path="articles" element={<ArticlesListPage />} />
            <Route path="articles/:id" element={<ArticlesDetailPage />} />
            <Route path="facilities" element={<HomeHashRedirect hash="facilities" />} />
            <Route path=":slug" element={<PublicCmsPage />} />
          </Route>
        ))}
        <Route path="*" element={<LegacyLocaleRedirect />} />
        </Routes>
      </InlineEditProvider>
    </CmsSiteProvider>
  )
}

export default App
