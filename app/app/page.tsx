'use client';

import { useMemo } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import { runSensiplan } from '@/lib/engine';
import { entries } from '@/lib/db';

function bgForState(state?: 'FERTILE'|'INFERTILE'|'USE_CAUTION') {
  if (state === 'FERTILE') return 'bg-fertile';
  if (state === 'INFERTILE') return 'bg-infertile';
  return 'bg-caution';
}

export default function TrackerPage(){
  const out = useMemo(() => runSensiplan(entries, { unit:'C', earlyInfertile:'off' }), [entries]);
  const today = new Date().toISOString().slice(0,10);
  const todayMarker = out.markers[today];
  const pageBgClass = bgForState(todayMarker?.state as any);

  return (
    <div className={`pageBg ${pageBgClass} min-h-screen p-4`}>
      <div className="hero p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">Today</div>
            <div className="text-2xl font-semibold">
              {new Date().toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' })}
            </div>
          </div>
          <StatusPill status={todayMarker?.state || 'USE_CAUTION'} />
        </div>
      </div>
      {/* ...rest of tracker content */}
    </div>
  )
}
