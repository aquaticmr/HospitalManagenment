import React, { useState, useEffect, useCallback } from 'react'
import { getDoctors, getDoctorSlots, bookSlot, getPatientAppointments } from '../api/axios'
import toast from 'react-hot-toast'
import { Search, Calendar, Clock, User, Stethoscope, CheckCircle, XCircle, Timer } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = { PENDING: 'status-pending', APPROVED: 'status-approved', REJECTED: 'status-rejected' }
  const icons = { PENDING: <Timer className="w-3 h-3" />, APPROVED: <CheckCircle className="w-3 h-3" />, REJECTED: <XCircle className="w-3 h-3" /> }
  return (
    <span className={`status-badge ${map[status]} gap-1`}>
      {icons[status]} {status}
    </span>
  )
}

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('doctors')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await getDoctors(search)
      setDoctors(res.data)
    } catch { toast.error('Failed to load doctors') }
  }, [search])

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await getPatientAppointments()
      setAppointments(res.data)
    } catch { toast.error('Failed to load appointments') }
  }, [])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])
  useEffect(() => { if (activeTab === 'appointments') fetchAppointments() }, [activeTab, fetchAppointments])

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor)
    setLoadingSlots(true)
    try {
      const res = await getDoctorSlots(doctor.id)
      setSlots(res.data)
    } catch { toast.error('Failed to load slots') }
    finally { setLoadingSlots(false) }
  }

  const handleBook = async (slotId) => {
    setBookingId(slotId)
    try {
      await bookSlot(slotId)
      toast.success('Appointment booked!')
      setSlots(slots.filter(s => s.id !== slotId))
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data || 'Booking failed')
    } finally { setBookingId(null) }
  }

  const formatTime = (t) => new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
        <p className="text-slate-500 mt-1">Find doctors and book appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['doctors', 'Find Doctors'], ['appointments', 'My Appointments']].map(([key, label]) => (
          <button key={key} id={`tab-${key}`} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === key ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'doctors' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Doctor list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="doctor-search" className="input-field pl-11" placeholder="Search doctors..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {doctors.length === 0 ? (
                <div className="card p-6 text-center text-slate-500">No doctors found</div>
              ) : doctors.map(doc => (
                <button key={doc.id} id={`doctor-${doc.id}`}
                  onClick={() => handleSelectDoctor(doc)}
                  className={`w-full card p-4 text-left hover:border-primary-500 transition-all duration-300 ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{doc.fullName}</p>
                      <p className="text-xs text-slate-500">{doc.specialization || 'General'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="lg:col-span-2">
            {!selectedDoctor ? (
              <div className="card p-12 text-center text-slate-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a doctor to view available slots</p>
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedDoctor.fullName}</h2>
                    <p className="text-sm text-slate-500">{selectedDoctor.specialization || 'General'}</p>
                  </div>
                </div>
                {loadingSlots ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No available slots</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {slots.map(slot => (
                      <div key={slot.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-primary-500 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 text-slate-500 mb-4">
                          <Calendar className="w-4 h-4 text-primary-500" />
                          <span className="text-sm">{formatTime(slot.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 mb-4">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-xs">Until {formatTime(slot.endTime)}</span>
                        </div>
                        <button id={`book-slot-${slot.id}`}
                          onClick={() => handleBook(slot.id)}
                          disabled={bookingId === slot.id}
                          className="btn-success w-full text-sm">
                          {bookingId === slot.id ? 'Booking...' : 'Book Slot'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">My Appointments</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-2xl border-dashed">No appointments yet</div>
          ) : (
            <div className="space-y-3">
              {appointments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{a.doctorName}</p>
                      <p className="text-xs text-primary-600 font-bold mb-0.5">Queue #{a.queueNumber}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">{formatTime(a.startTime)} – {formatTime(a.endTime)}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PatientDashboard
