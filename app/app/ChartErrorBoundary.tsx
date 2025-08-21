
'use client'
import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean, message?: string }

export default class ChartErrorBoundary extends React.Component<Props, State>{
  constructor(props: Props){
    super(props); this.state = { hasError: false }
  }
  static getDerivedStateFromError(err: any){
    return { hasError: true, message: String(err?.message || err) }
  }
  componentDidCatch(err:any, info:any){
    // no-op; could log to meta later
  }
  render(){
    if (this.state.hasError){
      return <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
        Chart failed to render. Try switching axis to <b>Calendar</b> or toggling chart mode. <div className="mt-1 text-xs opacity-70">{this.state.message}</div>
      </div>
    }
    return this.props.children as any
  }
}
