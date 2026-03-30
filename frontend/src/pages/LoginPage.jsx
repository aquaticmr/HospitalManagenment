import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi, register as registerApi } from '../api/axios'
import toast from 'react-hot-toast'
import { Activity, Mail, Lock, User, Stethoscope, ChevronRight } from 'lucide-react'

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [role, setRole] = useState('PATIENT')
  const [form, setForm] = useState({ username: '', password: '', fullName: '', specialization: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (isRegister) {
        res = await registerApi({ ...form, role })
        toast.success('Account created!')
      } else {
        res = await loginApi({ username: form.username, password: form.password })
        toast.success('Welcome back!')
      }
      login(res.data)
      navigate(res.data.role === 'DOCTOR' ? '/doctor' : '/patient')
    } catch (err) {
      toast.error(err.response?.data || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-600 opacity-10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-500 opacity-10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl shadow-primary-500/30 mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">MediCare</h1>
          <p className="text-slate-500 mt-1 text-sm">Hospital Management System</p>
        </div>

        <div className="card p-8">
          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200">
            {['Login', 'Register'].map((t) => (
              <button
                key={t}
                id={`${t.toLowerCase()}-tab`}
                onClick={() => setIsRegister(t === 'Register')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isRegister === (t === 'Register')
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                {/* Role selector */}
                <div className="flex gap-3 mb-2">
                  {['PATIENT', 'DOCTOR'].map((r) => (
                    <button
                      key={r} type="button"
                      id={`role-${r.toLowerCase()}`}
                      onClick={() => setRole(r)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 font-medium text-sm ${
                        role === r
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'DOCTOR' ? <Stethoscope className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {r}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="input-field pl-11"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>

                {role === 'DOCTOR' && (
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input-field pl-11"
                      placeholder="Specialization (e.g. Cardiology)"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="username-input"
                className="input-field pl-11"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="password-input"
                type="password"
                className="input-field pl-11"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
