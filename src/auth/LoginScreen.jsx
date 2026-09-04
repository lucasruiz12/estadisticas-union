import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { firebaseEnabled } from '../firebase'
import { isValidUsername } from './authIdentity'

const LOGO = '/union.svg'

export function LoginScreen() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(firebaseEnabled ? '' : 'union')
  const [pass, setPass] = useState(firebaseEnabled ? '' : 'union2024')
  const [error, setError] = useState(false)

  if (session) return <Navigate to="/app" replace />

  const submit = (e) => {
    e.preventDefault()
    setError(false)
    if (firebaseEnabled && !isValidUsername(user)) {
      setError(true)
      return
    }
    login({ user, pass })
      .then(() => {
        navigate('/app')
      })
      .catch(() => setError(true))
  }

  return (
    <div className="loginWrap">
      <div className="box">
        <img src={LOGO} className="loginLogo" alt="Unión Eléctrica" />
        <h2 style={{ color: 'var(--red2)' }}>UNION ELECTRICA</h2>
        <form onSubmit={submit}>
          <input
            placeholder="Usuario"
            required
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit" className="pr">
            ENTRAR AL SISTEMA
          </button>
        </form>
        {error ? (
          <small className="errMsg">Usuario o clave incorrecto</small>
        ) : null}
      </div>
    </div>
  )
}
