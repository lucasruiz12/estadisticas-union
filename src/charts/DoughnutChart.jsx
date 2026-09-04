import { useEffect, useRef } from 'react'
import { Chart, PIE_COLORS } from './registerCharts'

export function DoughnutChart({ labels, data, title, titleColor }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: PIE_COLORS }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            color: titleColor,
            font: { weight: 'bold', size: 10 },
          },
          legend: {
            position: 'bottom',
            labels: { color: '#fff', font: { size: 9 } },
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 10 },
            formatter: (value, ctx) => {
              const sum = ctx.dataset.data.reduce((a, b) => a + b, 0)
              if (sum === 0 || value === 0) return ''
              return `${((value * 100) / sum).toFixed(0)}%`
            },
          },
        },
      },
    })

    return () => chart.destroy()
  }, [labels, data, title, titleColor])

  return <canvas ref={canvasRef} />
}
