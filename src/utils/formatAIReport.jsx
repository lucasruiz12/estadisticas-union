export function renderFormattedAIReport(text) {
  if (!text) return null;

  // Limpiamos los marcadores de Markdown comunes y los separamos por líneas
  const lines = text.split('\n');

  return lines.map((line, index) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div key={index} style={{ height: '8px' }} />;

    // Detectar títulos tipo ### o **TÍTULO**
    if (cleanLine.startsWith('###') || (cleanLine.startsWith('**') && cleanLine.endsWith('**') && cleanLine.length < 50)) {
      const titleText = cleanLine.replace(/###|\*\*/g, '').trim();
      return (
        <div key={index} style={{ color: '#4eff8a', fontWeight: 'bold', fontSize: '13px', marginTop: '10px', textTransform: 'uppercase' }}>
          {titleText}
        </div>
      );
    }

    // Reemplazar negritas internas **texto** por spans destacados
    const parts = cleanLine.split(/\*\*(.*?)\*\*/g);

    return (
      <p key={index} style={{ color: '#fff', fontSize: '12px', lineHeight: '1.4', margin: '4px 0' }}>
        {parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} style={{ color: '#4eff8a' }}>{part}</strong> : part
        )}
      </p>
    );
  });
}