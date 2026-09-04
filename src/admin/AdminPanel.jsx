import { useCallback, useEffect, useState } from 'react'
import {
  ADMIN_COLLECTIONS,
  getAdminDocuments,
  importDocuments,
  saveAdminDocument,
  softDeleteAdminDocument,
  createPlayerWithAuth,
} from '../data/adminRepository'
import { usernameFromProfile } from '../auth/authIdentity'
import { getTorneoFromFase } from '../domain/stats'
import { useStats } from '../data/StatsContext'

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';')
      ? ';'
      : ','
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]
    if (character === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  if (cell || row.length) {
    row.push(cell.trim())
    rows.push(row)
  }

  const [rawHeaders, ...values] = rows
  const headers = rawHeaders?.map((header) => header.replace(/^\uFEFF/, ''))
  if (!headers?.length) return []
  return values.map((items) =>
    Object.fromEntries(headers.map((header, index) => [header, items[index] || ''])),
  )
}

function parseInput(text, format) {
  if (format === 'csv') return parseCsv(text)
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed
  return Object.entries(parsed).map(([id, data]) => ({ id, ...data }))
}

export function AdminPanel() {
  const { profiles, records } = useStats()
  const [section, setSection] = useState('manual')
  const [manualType, setManualType] = useState('jugadores')
  const [manualId, setManualId] = useState('')
  const [manualData, setManualData] = useState({})
  const [items, setItems] = useState([])
  const [collectionName, setCollectionName] = useState('jugadores')
  const [format, setFormat] = useState('json')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(null)
  const [working, setWorking] = useState(false)
  const [createAuth, setCreateAuth] = useState(true)
  const [teams, setTeams] = useState([])
  const [recordTournament, setRecordTournament] = useState('')

  const tournaments = [...new Set(records.map((record) => getTorneoFromFase(record.fase)))]
  const filteredRecords = recordTournament
    ? records.filter((record) => getTorneoFromFase(record.fase) === recordTournament)
    : records

  const loadItems = useCallback(async () => {
    if (manualType === 'jugadores') {
      setItems(Object.entries(profiles).map(([id, data]) => ({ id, ...data })))
    } else if (manualType === 'registros') {
      setItems(filteredRecords)
    } else {
      setItems(await getAdminDocuments(manualType))
    }
  }, [filteredRecords, manualType, profiles])

  useEffect(() => {
    if (section !== 'manual') return undefined
    let cancelled = false
    Promise.resolve().then(loadItems)
    getAdminDocuments('equipos').then((documents) => {
      if (!cancelled) setTeams(documents)
    }).catch(() => setTeams([]))
    return () => {
      cancelled = true
    }
  }, [loadItems, manualType, section])

  const updateField = (field, value) => {
    setManualData((current) => ({ ...current, [field]: value }))
  }

  const onManualSave = async (event) => {
    event.preventDefault()
    setWorking(true)
    setStatus(null)
    try {
      const data = manualType === 'jugadores'
        ? {
            ...manualData,
            edad: Number(manualData.edad || 0),
            activo: true,
            teamId: manualData.teamId || teams[0]?.id || import.meta.env.VITE_DEFAULT_TEAM_ID,
          }
        : manualType === 'equipos' ? {
            ...manualData,
            activo: true,
          } : {
            ...manualData,
            totalAcciones: Number(manualData.totalAcciones || 0),
            puntos: Number(manualData.puntos || 0),
            errores: Number(manualData.errores || 0),
            activo: true,
          }
      if (manualType === 'jugadores' && !data.username && data.nombreOnly && data.apellido) {
        data.username = usernameFromProfile(data)
      }
      const isNewPlayer = manualType === 'jugadores' && !items.some((item) => item.id === manualId)
      if (isNewPlayer && createAuth) {
        const password = String(data.dni || '').replace(/\D/g, '')
        if (!data.username || password.length < 6) {
          throw new Error('El jugador necesita username y un DNI de al menos 6 digitos.')
        }
        const uid = await createPlayerWithAuth({
          playerId: manualId,
          player: data,
          username: data.username,
          password,
          teamId: data.teamId,
        })
        setStatus({ type: 'success', message: `Jugador y usuario creados. UID: ${uid}` })
      } else {
        await saveAdminDocument(manualType, manualId, data)
        setStatus({ type: 'success', message: 'Documento guardado correctamente.' })
      }
      setManualData({})
      setManualId('')
      await loadItems()
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setWorking(false)
    }
  }

  const onSoftDelete = async (item) => {
    if (!window.confirm(`¿Desactivar ${item.id}?`)) return
    setWorking(true)
    try {
      await softDeleteAdminDocument(manualType, item.id)
      setStatus({ type: 'success', message: 'Documento desactivado.' })
      await loadItems()
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setWorking(false)
    }
  }

  const editItem = (item) => {
    const { id, ...data } = item
    setManualId(id)
    setManualData(data)
  }

  const onFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json')
    setContent(await file.text())
    setStatus(null)
  }

  const onImport = async (event) => {
    event.preventDefault()
    setStatus(null)
    setWorking(true)
    try {
      const documents = parseInput(content, format)
      const imported = await importDocuments(collectionName, documents)
      setStatus({ type: 'success', message: `${imported} documentos importados.` })
      setContent('')
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="page">
      <div className="c adminPanel">
        <h3 style={{ marginTop: 0, color: 'var(--red2)' }}>
          ADMINISTRACIÓN DE DATOS
        </h3>
        <p className="muted adminHint">
          Gestioná jugadores o importá documentos a Firestore. Los torneos se
          derivan de los registros ya cargados, sin otra consulta.
        </p>
        <div className="adminTabs">
          <button type="button" className={section === 'manual' ? 'active' : ''} onClick={() => setSection('manual')}>ALTA Y EDICIÓN</button>
          <button type="button" className={section === 'import' ? 'active' : ''} onClick={() => setSection('import')}>IMPORTAR JSON/CSV</button>
        </div>
        {section === 'manual' ? (
          <>
            <div className="filtersRow">
              <label>TIPO<select value={manualType} onChange={(event) => { setManualType(event.target.value); setManualData({}); setManualId('') }}><option value="jugadores">Jugador</option><option value="equipos">Equipo</option><option value="registros">Registro</option></select></label>
              {manualType === 'registros' ? <label>TORNEO<select value={recordTournament} onChange={(event) => setRecordTournament(event.target.value)}><option value="">Todos los torneos</option>{tournaments.map((tournament) => <option key={tournament} value={tournament}>{tournament}</option>)}</select></label> : null}
            </div>
            <form onSubmit={onManualSave}>
              <div className="adminFormGrid">
                <label>ID DOCUMENTO<input value={manualId} onChange={(event) => setManualId(event.target.value)} placeholder={manualType === 'jugadores' ? 'ARDILES V.' : manualType === 'equipos' ? 'equipo-id' : 'registro-id'} required /></label>
                {manualType === 'jugadores' ? (
                  <>
                    <label>APELLIDO<input value={manualData.apellido || ''} onChange={(event) => updateField('apellido', event.target.value)} required /></label>
                    <label>PRIMER NOMBRE<input value={manualData.nombreOnly || ''} onChange={(event) => updateField('nombreOnly', event.target.value)} required /></label>
                    <label>NOMBRE COMPLETO<input value={manualData.nombre || ''} onChange={(event) => updateField('nombre', event.target.value)} required /></label>
                    <label>DNI<input value={manualData.dni || ''} onChange={(event) => updateField('dni', event.target.value)} /></label>
                    <label>POSICIÓN<input value={manualData.pos || ''} onChange={(event) => updateField('pos', event.target.value)} required /></label>
                    <label>EDAD<input type="number" value={manualData.edad || ''} onChange={(event) => updateField('edad', event.target.value)} /></label>
                    <label>TEAM ID<select value={manualData.teamId || ''} onChange={(event) => updateField('teamId', event.target.value)} required><option value="">Seleccionar equipo</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.nombre || team.id}</option>)}</select></label>
                    <label>FOTO URL<input type="url" value={manualData.fotoUrl || ''} onChange={(event) => updateField('fotoUrl', event.target.value)} /></label>
                  </>
                ) : manualType === 'equipos' ? (
                  <>
                    <label>NOMBRE<input value={manualData.nombre || ''} onChange={(event) => updateField('nombre', event.target.value)} required /></label>
                    <label>CÓDIGO<input value={manualData.codigo || ''} onChange={(event) => updateField('codigo', event.target.value)} /></label>
                    <label>SLUG<input value={manualData.slug || ''} onChange={(event) => updateField('slug', event.target.value)} required /></label>
                  </>
                ) : (
                  <>
                    <label>JUGADOR<select value={manualData.playerId || ''} onChange={(event) => updateField('playerId', event.target.value)} required><option value="">Seleccionar jugador</option>{Object.keys(profiles).map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
                    <label>FECHA<input type="date" value={manualData.fecha || ''} onChange={(event) => updateField('fecha', event.target.value)} required /></label>
                    <label>RIVAL<input value={manualData.rival || ''} onChange={(event) => updateField('rival', event.target.value)} required /></label>
                    <label>FASE / TORNEO<select value={manualData.fase || ''} onChange={(event) => updateField('fase', event.target.value)} required><option value="">Seleccionar torneo</option>{tournaments.map((tournament) => <option key={tournament} value={tournament}>{tournament}</option>)}</select></label>
                    <label>FUNDAMENTO<input value={manualData.fundamento || ''} onChange={(event) => updateField('fundamento', event.target.value)} required /></label>
                    <label>TOTAL ACCIONES<input type="number" min="0" value={manualData.totalAcciones || ''} onChange={(event) => updateField('totalAcciones', event.target.value)} /></label>
                    <label>PUNTOS<input type="number" min="0" value={manualData.puntos || ''} onChange={(event) => updateField('puntos', event.target.value)} /></label>
                    <label>ERRORES<input type="number" min="0" value={manualData.errores || ''} onChange={(event) => updateField('errores', event.target.value)} /></label>
                    <label>TEAM ID<select value={manualData.teamId || teams[0]?.id || ''} onChange={(event) => updateField('teamId', event.target.value)} required>{teams.map((team) => <option key={team.id} value={team.id}>{team.nombre || team.id}</option>)}</select></label>
                  </>
                )}
              </div>
              {manualType === 'jugadores' ? <label className="adminCheckbox"><input type="checkbox" checked={createAuth} onChange={(event) => setCreateAuth(event.target.checked)} /> CREAR USUARIO AUTH (contraseña inicial: DNI)</label> : null}
              <button type="submit" className="pr" disabled={working}>{working ? 'GUARDANDO...' : 'GUARDAR'}</button>
            </form>
            <div className="adminList">
              {items.map((item) => (
                <div className="adminListItem" key={item.id}>
                  <span><b>{item.id}</b><small>{item.nombre || item.slug || 'Sin nombre'}{item.activo === false ? ' · INACTIVO' : ''}</small></span>
                  <span><button type="button" onClick={() => editItem(item)}>Editar</button><button type="button" onClick={() => onSoftDelete(item)} disabled={item.activo === false || working}>Desactivar</button></span>
                </div>
              ))}
            </div>
            <div className="adminList">
              <b>TORNEOS DERIVADOS DE REGISTROS</b>
              {tournaments.map((tournament) => (
                <div className="adminListItem" key={tournament}>
                  <span><b>{tournament}</b><small>Calculado desde los registros en memoria</small></span>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {section === 'import' ? <form onSubmit={onImport}>
          <div className="filtersRow">
            <label>
              COLECCIÓN
              <select value={collectionName} onChange={(event) => setCollectionName(event.target.value)}>
                {ADMIN_COLLECTIONS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              FORMATO
              <select value={format} onChange={(event) => setFormat(event.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <label>
              ARCHIVO
              <span className="filePicker"><input id="admin-file" type="file" accept=".json,.csv,application/json,text/csv" onChange={onFile} /><label htmlFor="admin-file">ELEGIR ARCHIVO</label></span>
            </label>
          </div>
          <textarea
            className="adminTextarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder='[ { "id": "jugador-1", "nombre": "Jugador" } ]'
            required
          />
          <button type="submit" className="pr" disabled={working}>
            {working ? 'IMPORTANDO...' : 'IMPORTAR A FIRESTORE'}
          </button>
        </form> : null}
        {status ? (
          <p className={status.type === 'error' ? 'errMsg' : 'adminSuccess'}>
            {status.message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
