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

export function TabBar({ tab, onTab, role }) {
  const items = [
    { id: 1, label: 'FICHA TÉCNICA' },
    ...(role === 'profesor'
      ? [
          { id: 2, label: 'GRÁFICOS Y EQUIPO' },
          { id: 3, label: 'REGISTRO DE PARTIDOS' },
          { id: 4, label: 'ADMINISTRACIÓN' },
        ]
      : []),
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
  const { session, userProfile, profileError, authLoading } = useAuth()
  if (authLoading) return <LoadingScreen message="Verificando sesión..." />
  if (!session) return <Navigate to="/login" replace />
  if (
    profileError ||
    !userProfile ||
    !['profesor', 'jugador'].includes(userProfile.rol)
  ) {
    return <MissingProfileScreen />
  }
  return children
}

export function LoadingScreen({ message }) {
  return (
    <div className="loginWrap loadingMessage">
      <div className="box">
        <p className="muted">{message}</p>
      </div>
    </div>
  )
}

function MissingProfileScreen() {
  const { logout, profileError, session } = useAuth()
  const navigate = useNavigate()
  const errorCode = profileError?.code
  const detail =
    errorCode === 'permission-denied'
      ? 'Firebase rechazó la lectura. Publicá las reglas de firestore.rules.'
      : errorCode === 'profile-not-found'
        ? 'No existe un documento usuarios con este UID.'
        : errorCode
          ? `Código de error: ${errorCode}`
          : 'El documento no existe o no tiene un rol válido.'

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="loginWrap">
      <div className="box">
        <img src={LOGO} className="loginLogo" alt="Unión Eléctrica" />
        <h2 style={{ color: 'var(--red2)' }}>Perfil pendiente</h2>
        <p className="errMsg">
          No se pudo cargar el perfil de usuario.
        </p>
        <p className="muted">
          {detail}
        </p>
        <small className="muted">UID: {session?.uid || 'no disponible'}</small>
        <button type="button" className="pr" onClick={onLogout}>
          CERRAR SESIÓN
        </button>
      </div>
    </div>
  )
}
