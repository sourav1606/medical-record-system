import { useState, useEffect } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import { Users, Shield, Activity, Plus, Trash2, Search, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

const API = 'https://medical-record-backend-21h6.onrender.com'
const COLORS = ['#e94560', '#2ecc71', '#3498db', '#f39c12', '#9b59b6']

function App() {
  const [patients, setPatients] = useState([])
  const [filtered, setFiltered] = useState([])
  const [isChainValid, setIsChainValid] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('patients')
  const [form, setForm] = useState({
    patientId: '', name: '', age: '', bloodGroup: '', diagnosis: '', doctor: ''
  })

  useEffect(() => { fetchPatients() }, [])

  useEffect(() => {
    setFiltered(patients.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, patients])

  const fetchPatients = async () => {
    try {
      const res = await axios.get(API)
      setPatients(res.data.data)
      setFiltered(res.data.data)
      setIsChainValid(res.data.isChainValid)
    } catch {
      toast.error('Failed to fetch patients')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(API, form)
      toast.success('Patient record added successfully!')
      setForm({ patientId: '', name: '', age: '', bloodGroup: '', diagnosis: '', doctor: '' })
      setShowForm(false)
      fetchPatients()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add patient')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`)
      toast.success('Record deleted!')
      fetchPatients()
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Chart data
  const bloodGroupData = patients.reduce((acc, p) => {
    const existing = acc.find(x => x.name === p.bloodGroup)
    if (existing) existing.value++
    else acc.push({ name: p.bloodGroup, value: 1 })
    return acc
  }, [])

  const diagnosisData = patients.reduce((acc, p) => {
    const existing = acc.find(x => x.name === p.diagnosis)
    if (existing) existing.value++
    else acc.push({ name: p.diagnosis, value: 1 })
    return acc
  }, []).slice(0, 5)

  return (
    <div className="app">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">🏥 MedChain</div>
        <nav>
          <button className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>
            <Users size={18} /> Patients
          </button>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <Activity size={18} /> Dashboard
          </button>
          <button className={activeTab === 'blockchain' ? 'active' : ''} onClick={() => setActiveTab('blockchain')}>
            <Shield size={18} /> Blockchain
          </button>
        </nav>
        <div className={`chain-badge ${isChainValid ? 'valid' : 'invalid'}`}>
          {isChainValid ? '✅ Chain Valid' : '❌ Compromised'}
        </div>
      </div>

      {/* Main Content */}
      <div className="main">

        {/* Header */}
        <div className="topbar">
          <h2>{activeTab === 'patients' ? 'Patient Records' : activeTab === 'dashboard' ? 'Dashboard' : 'Blockchain Explorer'}</h2>
          {activeTab === 'patients' && (
            <div className="topbar-actions">
              <div className="search-box">
                <Search size={16} />
                <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <X size={16} onClick={() => setSearch('')} style={{cursor:'pointer'}} />}
              </div>
              <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                <Plus size={16} /> Add Patient
              </button>
            </div>
          )}
        </div>

        {/* Add Patient Form */}
        {showForm && activeTab === 'patients' && (
          <div className="form-card">
            <h3>New Patient Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input placeholder="Patient ID (e.g. P001)" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} required />
                <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input placeholder="Age" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required />
                <input placeholder="Blood Group (e.g. A+)" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} required />
                <input placeholder="Diagnosis" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required />
                <input placeholder="Doctor Name" value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">💾 Save Record</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'patients' && (
          <div className="patients-grid">
            {filtered.length === 0 ? (
              <div className="empty">No records found. Add a patient!</div>
            ) : (
              filtered.map(p => (
                <div className="patient-card" key={p._id}>
                  <div className="card-header">
                    <div className="avatar">{p.name.charAt(0)}</div>
                    <div>
                      <h3>{p.name}</h3>
                      <span className="patient-id">ID: {p.patientId}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="info-row"><span>🎂 Age</span><span>{p.age} years</span></div>
                    <div className="info-row"><span>🩸 Blood</span><span className="blood-badge">{p.bloodGroup}</span></div>
                    <div className="info-row"><span>🏥 Diagnosis</span><span>{p.diagnosis}</span></div>
                    <div className="info-row"><span>👨‍⚕️ Doctor</span><span>Dr. {p.doctor}</span></div>
                  </div>
                  <div className="block-info">
                    <span>🔗 Block #{p.blockIndex}</span>
                    <span className="hash">{p.blockHash?.slice(0, 25)}...</span>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(p._id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card blue">
                <Users size={32} />
                <div>
                  <h2>{patients.length}</h2>
                  <p>Total Patients</p>
                </div>
              </div>
              <div className="stat-card green">
                <Shield size={32} />
                <div>
                  <h2>{patients.length + 1}</h2>
                  <p>Blockchain Blocks</p>
                </div>
              </div>
              <div className="stat-card red">
                <Activity size={32} />
                <div>
                  <h2>{isChainValid ? '✅' : '❌'}</h2>
                  <p>Chain Status</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Blood Group Distribution</h3>
                {bloodGroupData.length === 0 ? <p className="no-data">No data yet</p> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={bloodGroupData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                        {bloodGroupData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-card">
                <h3>Top Diagnoses</h3>
                {diagnosisData.length === 0 ? <p className="no-data">No data yet</p> : (
                  <div className="diagnosis-list">
                    {diagnosisData.map((d, i) => (
                      <div className="diagnosis-item" key={i}>
                        <span>{d.name}</span>
                        <div className="bar-wrap">
                          <div className="bar" style={{width: `${(d.value / patients.length) * 100}%`, background: COLORS[i]}}></div>
                        </div>
                        <span>{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BLOCKCHAIN TAB */}
        {activeTab === 'blockchain' && (
          <div className="blockchain-explorer">
            <div className="chain-status-banner">
              <Shield size={24} />
              <span>Chain Integrity: {isChainValid ? '✅ All blocks valid and unmodified' : '❌ Chain has been compromised!'}</span>
            </div>
            {patients.map((p, i) => (
              <div className="block-card" key={p._id}>
                <div className="block-header">
                  <span className="block-num">Block #{p.blockIndex}</span>
                  <span className="block-time">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <div className="block-body">
                  <div className="hash-row"><strong>Hash:</strong><code>{p.blockHash}</code></div>
                  <div className="hash-row"><strong>Prev:</strong><code>{p.previousHash?.slice(0, 40)}...</code></div>
                  <div className="block-data">
                    <span>👤 {p.name}</span>
                    <span>🏥 {p.diagnosis}</span>
                    <span>👨‍⚕️ Dr. {p.doctor}</span>
                  </div>
                </div>
                {i < patients.length - 1 && <div className="chain-link">⛓️</div>}
              </div>
            ))}
            {patients.length === 0 && <div className="empty">No blocks yet. Add a patient!</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App