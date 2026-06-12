'use client';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

type Props = {
  phase: BreathPhase;
  progress: number;
  remainingTime: string;
  phaseLabel: string;
  subLabel: string;
};

const PHASE_SUB: Record<BreathPhase, string> = {
  inhale: 'ゆっくり鼻から',
  hold: 'そのまま静かに',
  exhale: 'ゆっくり口から',
};

export default function BreathingCircle({ phase, progress, remainingTime, phaseLabel, subLabel }: Props) {
  const scale = phase === 'inhale'
    ? 0.7 + 0.3 * progress
    : phase === 'exhale'
    ? 1.0 - 0.3 * progress
    : 1.0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      {/* Outermost ring */}
      <div
        className="absolute rounded-full transition-transform duration-[1200ms] ease-in-out"
        style={{
          width: 260,
          height: 260,
          background: 'radial-gradient(circle, rgba(255,56,92,0.04) 0%, rgba(255,56,92,0.08) 100%)',
          transform: `scale(${scale})`,
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute rounded-full border-2 border-[#FF385C]/15 transition-transform duration-[1200ms] ease-in-out"
        style={{
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(255,56,92,0.06) 0%, rgba(255,56,92,0.12) 100%)',
          transform: `scale(${scale})`,
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute rounded-full border-[3px] border-[#FF385C]/25 transition-transform duration-[1200ms] ease-in-out"
        style={{
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,56,92,0.08) 100%)',
          transform: `scale(${scale})`,
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-[#FF385C] text-lg font-semibold tracking-wide">
          {phaseLabel}
        </span>
        <span className="text-[40px] font-light text-[#222222] tabular-nums leading-none">
          {remainingTime}
        </span>
        <span className="text-[12px] text-[#999999] mt-1">
          {subLabel || PHASE_SUB[phase]}
        </span>
      </div>
    </div>
  );
}
