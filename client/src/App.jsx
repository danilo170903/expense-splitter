import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { getMe, logout } from './api.js'
import { AuthContext } from './auth.js'
import Login from './pages/Login.jsx'
import Groups from './pages/Groups.jsx'
import Group from './pages/Group.jsx'

export default function App() {
  const [user, setUser] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(setUser, () => setUser(null))
  }, [])

  async function handleLogout() {
    await logout().catch(() => null)
    setUser(null)
    navigate('/login')
  }

  const requireAuth = (page) => (user ? page : <Navigate to="/login" replace />)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-name">
            Podijeli troškove
          </Link>
          {user && (
            <div className="user">
              <span className="muted">{user.username}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Odjava
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="page">
        {user === undefined ? (
          <p className="muted">Učitavanje…</p>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={requireAuth(<Groups />)} />
            <Route path="/groups/:id" element={requireAuth(<Group />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </AuthContext.Provider>
  )
}
