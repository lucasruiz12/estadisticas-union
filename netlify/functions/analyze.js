const GEMINI_MODEL = 'gemini-3.1-flash-lite'

export default async (request) => {
const origin = request.headers.get('origin') || '*';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método no permitido' }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const data = await request.json()


    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada')
    }

    const prompt = `
Actúa como un entrenador analítico y experto en estadísticas de vóley. 
Analiza detalladamente los siguientes datos estadísticos de un jugador y genera un informe profesional, claro y constructivo en español para el cuerpo técnico.
REGLA ESTRICTA: NO incluyas la fecha, saludos, ni metadatos como "Asunto:" o "Fecha de análisis:". Empieza directamente con el título del informe y el punto "1. Resumen de Rendimiento".

DATOS DEL JUGADOR:
- Nombre/Datos: ${JSON.stringify(data.player)}
- Filtros aplicados (Torneo, Fase, Rival, Fundamento): ${JSON.stringify(data.filters)}
- Resumen estadístico general: ${JSON.stringify(data.resumen)}
- Desglose por fundamentos (Ataque, Saque, Recepción, etc.): ${JSON.stringify(data.fundamentos)}
- Registros individuales de jugadas: ${JSON.stringify(data.registros)}

Estructura el informe de la siguiente manera:
1. **Resumen de Rendimiento:** Breve evaluación general del desempeño en base a los filtros.
2. **Puntos Fuertes:** Qué fundamentos o métricas destacaron positivamente.
3. **Áreas de Mejora:** Aspectos específicos a corregir en los entrenamientos.
`


    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          input: prompt,
        }),
      },
    )

    const result = await response.json()

    console.log(result)

    if (!response.ok) {
      throw new Error(
        result?.error?.message || 'Error llamando a Gemini',
      )
    }

    const analysis =
      result?.output_text ||
      result?.steps
        ?.filter((step) => step.type === 'model_output')
        ?.flatMap((step) => step.content || [])
        ?.find((content) => content.type === 'text')
        ?.text ||
      ''

    if (!analysis) {
      throw new Error('Gemini no devolvió contenido')
    }

    return new Response(
      JSON.stringify({
        ok: true,
        analysis,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('ERROR EN ANALYZE:', error)

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Error procesando los datos',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}