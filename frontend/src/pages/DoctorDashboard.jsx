import React, { useState, useEffect, useCallback } from 'react'
import {
  addSlot, getDoctorOwnSlots, deleteSlot,
  getDoctorAppointments, updateAppointment
} from '../api/axios'
import toast from 'react-hot-toast'
import { PlusCircle, Trash2, CheckCircle, XCircle, Calendar, Clock, User, Timer } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = { PENDING: 'status-pending', APPROVED: 'status-approved', REJECTED: 'status-rejected' }
  const icons = { PENDING: <Timer className="w-3 h-3" />, APPROVED: <CheckCircle className="w-3 h-3" />, REJECTED: <XCircle className="w-3 h-3" /> }
  return <span className={`status-badge ${map[status]} gap-1`}>{icons[status]} {status}</span>
}

const DoctorDashboard = () => {
  const [slots, setSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('slots')
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' })
  const [adding, setAdding] = useState(false)
  const [actionId, setActionId] = useState(null)

  const fetchSlots = useCallback(async () => {
    try { const res = await getDoctorOwnSlots(); setSlots(res.data) }
    catch { toast.error('Failed to load slots') }
  }, [])

  const fetchAppointments = useCallback(async () => {
    try { const res = await getDoctorAppointments(); setAppointments(res.data) }
    catch { toast.error('Failed to load appointments') }
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])
  useEffect(() => { if (activeTab === 'appointments') fetchAppointments() }, [activeTab, fetchAppointments])

  const handleAddSlot = async (e) => {
    e.preventDefault()
    if (!newSlot.startTime || !newSlot.endTime) return toast.error('Please fill both times')
    setAdding(true)
    try {
      await addSlot({ startTime: newSlot.startTime, endTime: newSlot.endTime })
      toast.success('Slot added!')
      setNewSlot({ startTime: '', endTime: '' })
      fetchSlots()
    } catch { toast.error('Failed to add slot') }
    finally { setAdding(false) }
  }

  const handleDelete = async (id) => {
    setActionId(id)
    try { await deleteSlot(id); toast.success('Slot deleted'); setSlots(slots.filter(s => s.id !== id)) }
    catch { toast.error('Failed to delete slot') }
    finally { setActionId(null) }
  }

  const handleAppointmentAction = async (id, status) => {
    setActionId(id)
    try {
      await updateAppointment(id, status)
      toast.success(`Appointment ${status.toLowerCase()}`)
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
    } catch { toast.error('Action failed') }
    finally { setActionId(null) }
  }

  const formatTime = (t) => new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your slots and appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['slots', 'My Slots'], ['appointments', 'Appointments']].map(([key, label]) => (
          <button key={key} id={`tab-${key}`} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === key ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'}`}>
            {label}
            {key === 'appointments' && appointments.filter(a => a.status === 'PENDING').length > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {appointments.filter(a => a.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'slots' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add slot form */}
          <div className="card p-6 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-accent-400" /> Add New Slot
            </h2>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Start Time</label>
                <input id="slot-start" type="datetime-local" className="input-field text-sm"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">End Time</label>
                <input id="slot-end" type="datetime-local" className="input-field text-sm"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} required />
              </div>
              <button id="add-slot-btn" type="submit" disabled={adding} className="btn-success w-full flex items-center justify-center gap-2">
                {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                {adding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* Slot list */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Time Slots ({slots.length})</h2>
            {slots.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-2xl border-dashed">No slots added yet</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {slots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span>{new Date(slot.startTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${slot.isBooked ? 'bg-yellow-100 text-yellow-700' : 'bg-accent-100 text-accent-700'}`}>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                      {!slot.isBooked && (
                        <button id={`delete-slot-${slot.id}`}
                          onClick={() => handleDelete(slot.id)}
                          disabled={actionId === slot.id}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Appointment Requests</h2>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-2xl border-dashed">No pending appointment requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                    {['Patient', 'Queue', 'Time', 'Duration', 'Status', 'Action'].map(h => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-semibold text-sm">{a.patientName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">@{a.patientUsername}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">#{a.queueNumber}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col text-slate-900 text-sm">
                          <span className="font-medium">{formatTime(a.startTime)}</span>
                          <span className="text-slate-500 text-xs mt-0.5">Until {formatTime(a.endTime)}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{(new Date(a.endTime) - new Date(a.startTime)) / 60000} mins</td>
                      <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3">
                        {a.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button id={`approve-${a.id}`}
                              onClick={() => handleAppointmentAction(a.id, 'APPROVED')}
                              disabled={actionId === a.id}
                              className="flex items-center gap-1 btn-success text-xs py-1.5 px-3">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button id={`reject-${a.id}`}
                              onClick={() => handleAppointmentAction(a.id, 'REJECTED')}
                              disabled={actionId === a.id}
                              className="flex items-center gap-1 btn-danger text-xs py-1.5 px-3">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {a.status !== 'PENDING' && <span className="text-gray-500 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
