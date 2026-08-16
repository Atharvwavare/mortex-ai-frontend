import axios from 'axios'

// Use environment variable if available, otherwise fallback to localhost
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
})

// REQUEST INTERCEPTOR: Uses localStorage so it survives restarts
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// RESPONSE INTERCEPTOR: Handles both 401 and 403 errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // If unauthorized or forbidden, clear everything and reload
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear() // Clears token, user, and settings
      window.location.reload() // Forces a fresh page load (back to splash/login)
    }
    return Promise.reject(err)
  }
)

export default client