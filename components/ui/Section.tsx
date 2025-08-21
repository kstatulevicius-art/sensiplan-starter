'use client';
import { ReactNode } from 'react';

export default function Section({children, className}:{children:ReactNode,className?:string}) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm p-4 mb-4 ${className||''}`}>
      {children}
    </div>
  )
}