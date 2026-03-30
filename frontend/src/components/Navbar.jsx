import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Activity, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white bg-opacity-80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            MediCare
          </span>
        </Link>

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-none">{user.fullName}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="flex items-center gap-2 btn-ghost text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
