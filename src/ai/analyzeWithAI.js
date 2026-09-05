export const analyzeWithAI = async (data) => {

  const response = await fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Error en la Function: ${response.status}`)
  }

  const result = await response.json()

  return result
}