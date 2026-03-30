import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)

// Patient
export const getDoctors = (search) => api.get('/api/patient/doctors', { params: { search } })
export const getDoctorSlots = (doctorId) => api.get(`/api/patient/doctors/${doctorId}/slots`)
export const bookSlot = (slotId) => api.post(`/api/patient/book/${slotId}`)
export const getPatientAppointments = () => api.get('/api/patient/appointments')

// Doctor
export const addSlot = (data) => api.post('/api/doctor/slots', data)
export const getDoctorOwnSlots = () => api.get('/api/doctor/slots')
export const deleteSlot = (id) => api.delete(`/api/doctor/slots/${id}`)
export const getDoctorAppointments = () => api.get('/api/doctor/appointments')
export const updateAppointment = (id, status) => api.put(`/api/doctor/appointments/${id}`, { status })

export default api
