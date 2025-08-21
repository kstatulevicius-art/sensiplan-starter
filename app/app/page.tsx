'use client';
import Section from '@/components/ui/Section';
import Segmented from '@/components/ui/Segmented';
import ChipGroup from '@/components/ui/ChipGroup';
import Pill from '@/components/ui/Pill';
import StatusPill from '@/components/ui/StatusPill';

export default function Page(){
  return (
    <div className="hero min-h-screen p-4">
      <Section className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tracker</h1>
        <StatusPill status="Fertile" />
      </Section>

      <Section>
        <h2 className="font-semibold mb-2">Calendar</h2>
        <Segmented options={['Month','Week']} value="Month" onChange={()=>{}}/>
        <div className="mt-4 text-sm text-gray-600">[calendar grid here]</div>
      </Section>

      <Section>
        <h2 className="font-semibold mb-2">Daily Entry</h2>
        <ChipGroup options={['None','Light','Medium','Heavy']} />
        <div className="mt-2"><Pill label="Intercourse" /></div>
        <textarea className="w-full mt-2 border rounded-lg p-2" placeholder="Notes"/>
      </Section>

      <Section>
        <h2 className="font-semibold mb-2">Chart</h2>
        <Segmented options={['Classic','Enhanced']} value="Classic" onChange={()=>{}}/>
        <div className="mt-4 h-40 bg-gray-50 flex items-center justify-center text-gray-400">[chart here]</div>
      </Section>

      <Section>
        <h2 className="font-semibold mb-2">Decision</h2>
        <p className="text-sm text-gray-600">Decision details will appear here.</p>
      </Section>

      <Section>
        <h2 className="font-semibold mb-2">Settings</h2>
        <Segmented options={['Compact','Cozy','Comfy']} value="Cozy" onChange={()=>{}}/>
      </Section>
    </div>
  )
}