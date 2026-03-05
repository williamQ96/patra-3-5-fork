import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = 'http://localhost:5002'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('patra_user') || 'null'))
    const token = ref(localStorage.getItem('patra_token') || '')
    const loading = ref(false)
    const error = ref(null)

    const isLoggedIn = computed(() => !!user.value && !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const displayName = computed(() => user.value?.name || 'User')
    const initials = computed(() => {
        if (!user.value?.name) return '??'
        return user.value.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    })

    function persist() {
        localStorage.setItem('patra_user', JSON.stringify(user.value))
        localStorage.setItem('patra_token', token.value)
    }

    async function login(email, password) {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Login failed')
            user.value = data.user
            token.value = data.token
            persist()
            return true
        } catch (e) {
            error.value = e.message
            return false
        } finally {
            loading.value = false
        }
    }

    async function signup(name, email, password) {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Signup failed')
            user.value = data.user
            token.value = data.token
            persist()
            return true
        } catch (e) {
            error.value = e.message
            return false
        } finally {
            loading.value = false
        }
    }

    function logout() {
        user.value = null
        token.value = ''
        localStorage.removeItem('patra_user')
        localStorage.removeItem('patra_token')
    }

    return { user, token, loading, error, isLoggedIn, isAdmin, displayName, initials, login, signup, logout }
})
