import { useEffect, useRef } from 'react'
import { Chart } from './registerCharts'

export function RadarChart({ labels, datasets }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const chart = new Chart(canvas, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#1e2e5a' },
            grid: { color: '#1e2e5a' },
            pointLabels: { color: '#fff', font: { size: 10, weight: 'bold' } },
            ticks: { color: '#7a88a8', backdropColor: 'transparent' },
          },
        },
        plugins: {
          legend: { labels: { color: '#fff', font: { size: 11 } } },
          datalabels: { display: false },
        },
      },
    })

    return () => chart.destroy()
  }, [labels, datasets])

  return <canvas ref={canvasRef} />
}
