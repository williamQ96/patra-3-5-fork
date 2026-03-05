<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <IconDatabase :size="22" stroke-width="2" />
      </div>
      <span class="sidebar-title">Patra KB</span>
    </div>

    <nav class="sidebar-nav">
      <div class="sidebar-section-label">OVERVIEW</div>
      <RouterLink to="/" class="sidebar-link" :class="{ active: $route.path === '/' }">
        <IconLayoutDashboard :size="20" stroke-width="1.8" />
        <span>Dashboard</span>
      </RouterLink>

      <div class="sidebar-section-label">EXPLORE</div>
      <RouterLink to="/explore" class="sidebar-link" :class="{ active: $route.path.startsWith('/explore') }">
        <IconSearch :size="20" stroke-width="1.8" />
        <span>Browse Models</span>
      </RouterLink>

      <div class="sidebar-section-label">CONTRIBUTE</div>
      <RouterLink to="/submit" class="sidebar-link" :class="{ active: $route.path === '/submit' }">
        <IconUpload :size="20" stroke-width="1.8" />
        <span>Submit</span>
      </RouterLink>
      <RouterLink to="/tickets" class="sidebar-link" :class="{ active: $route.path === '/tickets' }">
        <IconMessageCircle :size="20" stroke-width="1.8" />
        <span>Tickets</span>
      </RouterLink>

      <template v-if="auth.isAdmin">
        <div class="sidebar-section-label">ADMIN</div>
        <RouterLink to="/models" class="sidebar-link" :class="{ active: $route.path === '/models' }">
          <IconCube :size="20" stroke-width="1.8" />
          <span>Models & Data</span>
        </RouterLink>
        <RouterLink to="/submissions" class="sidebar-link" :class="{ active: $route.path === '/submissions' }">
          <IconClipboardCheck :size="20" stroke-width="1.8" />
          <span>Review Submissions</span>
        </RouterLink>
        <RouterLink to="/ticket-management" class="sidebar-link" :class="{ active: $route.path === '/ticket-management' }">
          <IconListDetails :size="20" stroke-width="1.8" />
          <span>Manage Tickets</span>
        </RouterLink>
        <RouterLink to="/users" class="sidebar-link" :class="{ active: $route.path === '/users' }">
          <IconUserCog :size="20" stroke-width="1.8" />
          <span>User Management</span>
        </RouterLink>
        <RouterLink to="/groups" class="sidebar-link" :class="{ active: $route.path === '/groups' }">
          <IconUsersGroup :size="20" stroke-width="1.8" />
          <span>User Groups</span>
        </RouterLink>

        <div class="sidebar-section-label">SYSTEM</div>
        <RouterLink to="/audit-log" class="sidebar-link" :class="{ active: $route.path === '/audit-log' }">
          <IconFileText :size="20" stroke-width="1.8" />
          <span>Audit Log</span>
        </RouterLink>
        <RouterLink to="/settings" class="sidebar-link" :class="{ active: $route.path === '/settings' }">
          <IconSettings :size="20" stroke-width="1.8" />
          <span>Settings</span>
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">{{ auth.initials }}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ auth.displayName }}</div>
          <div class="sidebar-user-role">{{ auth.isAdmin ? 'Admin' : 'User' }}</div>
        </div>
        <button class="sidebar-logout" @click="handleLogout" title="Sign out">
          <IconLogout :size="18" stroke-width="1.8" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  IconLayoutDashboard, IconCube, IconUsersGroup,
  IconFileText, IconSettings, IconDatabase, IconSearch,
  IconUpload, IconMessageCircle, IconClipboardCheck,
  IconListDetails, IconUserCog, IconLogout,
} from '@tabler/icons-vue'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: var(--sidebar-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--color-border);
}
.sidebar-logo {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.sidebar-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 12px;
  overflow-y: auto;
}

.sidebar-section-label {
  font-size: .68rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: .8px;
  padding: 16px 12px 6px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: .92rem;
  transition: all var(--transition);
  text-decoration: none;
}
.sidebar-link:hover { background: var(--color-bg); color: var(--color-text); }
.sidebar-link.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.sidebar-footer {
  padding: 16px 18px;
  border-top: 1px solid var(--color-border);
}
.sidebar-user {
  display: flex; align-items: center; gap: 10px;
}
.sidebar-user-info { flex: 1; min-width: 0; }
.sidebar-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 700;
  font-size: .82rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sidebar-user-name { font-weight: 600; font-size: .88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: .75rem; color: var(--color-text-muted); }

.sidebar-logout {
  border: none; background: none;
  color: var(--color-text-muted); cursor: pointer;
  padding: 6px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
  flex-shrink: 0;
}
.sidebar-logout:hover { color: var(--color-danger); background: var(--color-danger-bg); }
</style>
