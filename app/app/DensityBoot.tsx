'use client'
import { useEffect } from 'react'

export default function DensityBoot(){
  useEffect(()=>{
    function setFromStorage(){
      const v = (typeof window!=='undefined' && localStorage.getItem('density')) || 'cozy'
      document.documentElement.setAttribute('data-density', v)
    }
    setFromStorage()
    const onChange = (e: any) => {
      const v = e?.detail || (localStorage.getItem('density') || 'cozy')
      document.documentElement.setAttribute('data-density', v)
    }
    window.addEventListener('density-change', onChange as any)
    return ()=> window.removeEventListener('density-change', onChange as any)
  }, [])
  return null
}
