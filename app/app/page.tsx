'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { runSensiplan, type Day as EngineDay } from '@/lib/engine'
import { db, type Day as DbDay } from '@/lib/db'
import { Section as Card, Header } from '@/components/ui/Section'
import Segmented from '@/components/ui/Segmented'
import StatusBanner from '@/components/ui/StatusBanner'
import MonthGrid from './calendar/MonthGrid'
import WeekStrip from './calendar/WeekStrip'
import { fromId, toId } from './calendar/utils'
import SettingsDemo from './SettingsDemo'
import DailyModal from './DailyModal'
import '../_calendar.css'
import '../_globals_calm.css'

const ChartSensiplan = dynamic(() => import('./ChartSensiplanSVG'), { ssr: false })

type Entry = EngineDay
type AxisMode = 'calendar' | 'cycle'

function todayId() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function bgForState(state?: 'FERTILE' | 'INFERTILE' | 'USE_CAUTION') {
  if (state === 'FERTILE') return 'bg-fertile'
  if (state === 'INFERTILE') return 'bg-infertile'
  return 'bg-caution'
}

export default function Tracker() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>(
    () => (typeof window !== 'undefined' && (localStorage.getItem('calMode') as any)) || 'month'
  )
  const [axisMode, setAxisMode] = useState<AxisMode>(
    () => (typeof window !== 'undefined' && (localStorage.getItem('axisMode') as any)) || 'calendar'
  )

  const [selectedId, setSelectedId] = useState<string>(() => todayId())
  const [monthCursor, setMonthCursor] = useState<Date>(() => fromId(todayId()))
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    db.days.toArray().then((ds) => setEntries(ds.sort((a, b) => a.id.localeCompare(b.id)) as Entry[]))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('calMode', calendarMode)
  }, [calendarMode])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('axisMode', axisMode)
  }, [axisMode])

  const out = useMemo(() => runSensiplan(entries, { unit: 'C', earlyInfertile: 'off' }), [entries])
  const selectedMarker = out.markers[selectedId]

  const monthTitle = monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const pageBgClass = bgForState(selectedMarker?.state as any)

  const statusMap: Record<
    string,
    {
      filled: boolean
      bleeding: any
      state: 'FERTILE' | 'INFERTILE' | 'USE_CAUTION'
      hasCoitus: boolean
      hasFertileMucus: boolean
    }
  > = {}
  for (const d of entries) {
    statusMap[d.id] = {
      filled: !!(d.bbt || d.bleeding !== 'none' || d.mucusSensation !== 'dry' || d.mucusAppearance !== 'none' || d.coitus?.events?.length || d.notes),
      bleeding: d.bleeding,
      state: (out.markers[d.id]?.state as any) ?? 'USE_CAUTION',
      hasCoitus: !!d.coitus?.events?.length,
      hasFertileMucus: d.mucusSensation === 'slippery' || d.mucusAppearance === 'clear' || d.mucusAppearance === 'stretchy',
    }
  }

  const selectedEntry = entries.find((e) => e.id === selectedId)

  const decisionText: string = (() => {
    const ex = out.markers[selectedId]?.explanations
    if (ex && ex.length) return ex.join(' ')
    if (selectedMarker?.state === 'INFERTILE')
      return 'No fertile-type mucus observed and the temperature pattern suggests an infertile phase for this day.'
    if (selectedMarker?.state === 'FERTILE') return 'Fertile-type mucus or the temperature pattern suggests a fertile phase today.'
    return 'There isn’t enough information yet. For safety, treat today as fertile.'
  })()

  async function upsertDay(patch: any) {
    const merged = { ...(selectedEntry || { id: selectedId }), ...patch }
    await db.days.put(merged as DbDay)
    const ds = await db.days.toArray()
    setEntries(ds.sort((a, b) => a.id.localeCompare(b.id)) as Entry[])
  }

  return (
    <div className={`pageBg ${pageBgClass} min-h-screen`}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header / hero */}
        <div className="hero p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">
                {new Date(selectedId).toLocaleDateString(undefined, { weekday: 'long' })}
              </div>
              <div className="text-2xl font-semibold">
                {new Date(selectedId).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <StatusBanner state={selectedMarker?.state as any} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm"
              onClick={() => setModalOpen(true)}
            >
              Log Today
            </button>
          </div>
        </div>

        {/* Calendar */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Calendar</div>
            <div className="flex items-center gap-2">
              {calendarMode === 'month' && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm"
                    onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-slate-600">{monthTitle}</div>
                  <button
                    className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm"
                    onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                  >
                    Next
                  </button>
                </div>
              )}
              {calendarMode === 'week' && (
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Prev week"
                    className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm"
                    onClick={() => {
                      const d = fromId(selectedId)
                      d.setDate(d.getDate() - 7)
                      const id = toId(d)
                      setSelectedId(id)
                      setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1))
                    }}
                  >
                    Prev week
                  </button>
                  <div className="text-sm text-slate-600">
                    {new Date(selectedId).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    aria-label="Next week"
                    className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm"
                    onClick={() => {
                      const d = fromId(selectedId)
                      d.setDate(d.getDate() + 7)
                      const id = toId(d)
                      setSelectedId(id)
                      setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1))
                    }}
                  >
                    Next week
                  </button>
                </div>
              )}
              <Segmented
                value={calendarMode}
                onChange={(v) => setCalendarMode(v as 'month' | 'week')}
                options={[
                  { value: 'month', label: 'Month' },
                  { value: 'week', label: 'Week' },
                ]}
              />
            </div>
          </div>
          {calendarMode === 'month' ? (
            <MonthGrid
              current={monthCursor}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setMonthCursor(new Date(id))
              }}
              statusMap={statusMap}
            />
          ) : (
            <WeekStrip selectedId={selectedId} onSelect={setSelectedId} statusMap={statusMap} />
          )}
        </Card>

        {/* Chart */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Chart</div>
            <div className="flex gap-2">
              <Segmented
                value={axisMode}
                onChange={(v) => setAxisMode(v as AxisMode)}
                options={[
                  { value: 'calendar', label: 'Calendar' },
                  { value: 'cycle', label: 'Cycle' },
                ]}
              />
            </div>
          </div>
          <ChartSensiplan days={entries} markers={out.markers} axisMode={axisMode} mode="enhanced" />
        </Card>

        {/* Decision details */}
        <Card>
          <Header title="Decision details" />
          <p className="text-sm text-slate-700">{decisionText}</p>
        </Card>

        {/* Settings (demo) */}
        <Card>
          <Header title="Settings" />
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsDemo
              onAfterChange={async () => {
                const ds = await db.days.toArray()
                setEntries(ds.sort((a, b) => a.id.localeCompare(b.id)) as Entry[])
              }}
            />
          </div>
        </Card>
      </div>

      {/* Daily modal */}
      <DailyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={{
          id: selectedId,
          bbt: selectedEntry?.bbt,
          bleeding: selectedEntry?.bleeding,
          mucusSensation: selectedEntry?.mucusSensation,
          mucusAppearance: selectedEntry?.mucusAppearance,
          notes: selectedEntry?.notes,
          coitus: selectedEntry?.coitus as any,
        }}
        onSave={async (patch) => {
          const merged = { ...(selectedEntry || { id: selectedId }), ...patch }
          await db.days.put(merged as DbDay)
          const ds = await db.days.toArray()
          setEntries(ds.sort((a, b) => a.id.localeCompare(b.id)) as Entry[])
        }}
      />
    </div>
  )
}
