export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
  style,
}) {
  return (
    <div className={className || 'filterBox'}>
      {label ? <label>{label}</label> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={style}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
