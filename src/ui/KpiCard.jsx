export function KpiCard({
  label,
  labelClass,
  borderClass,
  children,
  style,
}) {
  const className = ['kpiCard', borderClass].filter(Boolean).join(' ')
  return (
    <div className={className} style={style}>
      {label ? (
        <div className={['kpiLabel', labelClass].filter(Boolean).join(' ')}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  )
}
