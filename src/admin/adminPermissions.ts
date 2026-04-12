/** Mirrors `Database\Seeders\RolePermissionSeeder::PERMISSIONS` (underscores; Laravel parses `permission:a.b` incorrectly). */
export const ADMIN_PERMISSIONS = {
  dashboardView: "dashboard_view",
  registrationsView: "registrations_view",
  registrationsUpdate: "registrations_update",
  registrationsExport: "registrations_export",
  bookTourView: "book_tour_view",
  bookTourUpdate: "book_tour_update",
  contactMessagesView: "contact_messages_view",
  contactMessagesUpdate: "contact_messages_update",
  contentPagesManage: "content_pages_manage",
  cmsManage: "cms_manage",
  cmsSettingsManage: "cms_settings_manage",
  mediaManage: "media_manage",
  inlineEdit: "inline_edit",
  postsManage: "posts_manage",
  usersManage: "users_manage",
} as const
