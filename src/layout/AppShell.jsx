import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LOGO = '/union.svg'

export function AppHeader() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="top">
      <img src={LOGO} alt="Unión Eléctrica" />
      <div>
        <b style={{ color: 'var(--red2)' }}>UNION ELECTRICA</b>
        <br />
        <small style={{ opacity: 0.6 }}>SISTEMA TÉCNICO & ESTADÍSTICAS</small>
      </div>
      <button type="button" className="btnSalir" onClick={onLogout}>
        Salir
      </button>
    </div>
  )
}

export function TabBar({ tab, onTab }) {
  const items = [
    { id: 1, label: 'FICHA TÉCNICA' },
    { id: 2, label: 'GRÁFICOS Y EQUIPO' },
    { id: 3, label: 'REGISTRO DE PARTIDOS' },
  ]
  return (
    <div className="tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={tab === item.id ? 'active' : ''}
          onClick={() => onTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function RequireAuth({ children }) {
  const { session, authLoading } = useAuth()
  if (authLoading) return <p className="muted">Verificando sesión...</p>
  if (!session) return <Navigate to="/login" replace />
  return children
}
