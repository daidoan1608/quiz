export const ADMIN_ROUTES = [
  { path: '/', menu: 'MENU_DASHBOARD' },
  { path: '/notifications', menu: 'MENU_NOTIFICATIONS' },
  { path: '/documents', menu: 'MENU_DOCUMENTS' },
  { path: '/audit-logs', menu: 'MENU_AUDIT_LOGS' },
  { path: '/userexams', menu: 'MENU_USER_EXAMS' },
  { path: '/users', menu: 'MENU_USERS' },
  { path: '/groups', menu: 'MENU_GROUPS' },
  { path: '/exams', menu: 'MENU_EXAMS' },
  { path: '/categories', menu: 'MENU_CATEGORIES' },
  { path: '/subjects', menu: 'MENU_SUBJECTS' },
  { path: '/chapters', menu: 'MENU_CHAPTERS' },
  { path: '/questions', menu: 'MENU_QUESTIONS' },
];

export const getFirstAllowedAdminPath = (user, canMenu) => {
  if (user?.role !== 'MOD') return '/';
  return ADMIN_ROUTES.find((route) => canMenu(route.menu))?.path || null;
};
