export function FundCard({ name, tot, pts, err, totalsLabel }) {
  return (
    <div className="fundCard">
      <div
        style={
          totalsLabel
            ? { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }
            : undefined
        }
      >
        <span className="fundCardName">{name.toUpperCase()}</span>
      </div>
      <div className="fundCardMetrics">
        <span>
          {totalsLabel || 'Acciones'}: <b>{tot}</b>
        </span>
        <span>
          {totalsLabel ? 'Puntos Directos' : 'Puntos'}:{' '}
          <b style={{ color: 'var(--green)' }}>{pts}</b>
        </span>
        <span>
          Errores: <b style={{ color: 'var(--red2)' }}>{err}</b>
        </span>
      </div>
    </div>
  )
}
