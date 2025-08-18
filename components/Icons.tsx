export function Dot({ className='' }:{ className?: string }){
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${className}`} />
}
export function HeartTiny(){ return <span aria-label="coitus" title="Intercourse">♡</span> }
export function BleedTiny(){ return <span aria-label="bleeding" title="Bleeding">🔴</span> }
export function FertileTiny(){ return <span aria-label="fertile" title="Fertile">🌱</span> }
export function InfertileTiny(){ return <span aria-label="infertile" title="Infertile">🌙</span> }
export function CautionTiny(){ return <span aria-label="caution" title="Use caution">▲</span> }
