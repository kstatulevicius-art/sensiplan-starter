'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Day } from '@/lib/engine'

export default function ChartBBT({ days, refMax }:{ days: Day[], refMax?: number }){
  const data = days.map(d => ({ id: d.id, bbt: d.bbt ?? null }))
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
          <XAxis dataKey="id" tick={{ fontSize: 10 }} />
          <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10 }} />
          <Tooltip />
          {refMax !== undefined && <ReferenceLine y={refMax} strokeDasharray="4 4" />}
          <Line type="monotone" dataKey="bbt" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
