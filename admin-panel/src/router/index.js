import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ModelsView from '../views/ModelsView.vue'
import GroupsView from '../views/GroupsView.vue'
import AuditLogView from '../views/AuditLogView.vue'
import SettingsView from '../views/SettingsView.vue'
import ExploreView from '../views/ExploreView.vue'
import ModelDetailView from '../views/ModelDetailView.vue'
import SubmitView from '../views/SubmitView.vue'
import TicketSubmitView from '../views/TicketSubmitView.vue'
import SubmissionsReviewView from '../views/SubmissionsReviewView.vue'
import TicketManagementView from '../views/TicketManagementView.vue'
import UserManagementView from '../views/UserManagementView.vue'

const routes = [
    { path: '/login', name: 'Login', component: LoginView, meta: { public: true, hideLayout: true } },

    // Logged-in routes
    { path: '/', name: 'Dashboard', component: DashboardView },
    { path: '/explore', name: 'Explore', component: ExploreView },
    { path: '/explore/:id', name: 'ModelDetail', component: ModelDetailView },
    { path: '/submit', name: 'Submit', component: SubmitView },
    { path: '/tickets', name: 'Tickets', component: TicketSubmitView },

    // Admin routes
    { path: '/models', name: 'Models', component: ModelsView, meta: { admin: true } },
    { path: '/submissions', name: 'SubmissionsReview', component: SubmissionsReviewView, meta: { admin: true } },
    { path: '/ticket-management', name: 'TicketManagement', component: TicketManagementView, meta: { admin: true } },
    { path: '/users', name: 'UserManagement', component: UserManagementView, meta: { admin: true } },
    { path: '/groups', name: 'Groups', component: GroupsView, meta: { admin: true } },
    { path: '/audit-log', name: 'AuditLog', component: AuditLogView, meta: { admin: true } },
    { path: '/settings', name: 'Settings', component: SettingsView, meta: { admin: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const auth = useAuthStore()

    // Public routes (login) — skip auth check
    if (to.meta.public) {
        // If already logged in, go to dashboard
        if (auth.isLoggedIn) return { name: 'Dashboard' }
        return true
    }

    // Not logged in → send to login
    if (!auth.isLoggedIn) return { name: 'Login' }

    // Admin-only routes
    if (to.meta.admin && !auth.isAdmin) return { name: 'Dashboard' }

    return true
})

export default router
