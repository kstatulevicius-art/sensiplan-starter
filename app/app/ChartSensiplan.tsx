'use client'
import dynamic from 'next/dynamic'

// Route everything through the dependency-free SVG chart.
const ChartSensiplanSVG = dynamic(() => import('./ChartSensiplanSVG'), { ssr: false })

export default function ChartSensiplan(props: any) {
  // Accepts same props as the old chart: { days, markers, axisMode }
  return <ChartSensiplanSVG {...props} />
}
