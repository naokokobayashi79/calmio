'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ScoreInput from '@/components/ScoreInput';
import FeatureChip from '@/components/FeatureChip';
import SectionCard from '@/components/SectionCard';
import PrimaryButton from '@/components/PrimaryButton';
import type { ConditionType, DurationMinutes, SoundType, BodyScores } from '@/types';

const CONDITIONS: { label: ConditionType; emoji: string }[] = [
  { label: '体が重い', emoji: '🪨' },
  { label: 'だるい', emoji: '😮‍💨' },
  { label: '筋肉痛', emoji: '💪' },
  { label: '肩や首がつらい', emoji: '🤕' },
  { label: '緊張している', emoji: '😰' },
  { label: '眠い', emoji: '😴' },
  { label: '集中したい', emoji: '🎯' },
  { label: '気分を整えたい', emoji: '🌿' },
];

const DURATIONS: DurationMinutes[] = [3, 5, 10];

const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: 'none', label: 'OFF' },
  { value: '432Hz', label: '432Hz' },
  { value: '528Hz', label: '528Hz' },
  { value: 'ambient', label: '環境音' },
];

const defaultScores: BodyScores = {
  bodyLightness: 5,
  painRelief: 5,
  fatigueRelief: 5,
  mood: 5,
};

export default function HomePage() {
  const router = useRouter();
  const [condition, setCondition] = useState<ConditionType | null>(null);
  const [duration, setDuration] = useState<DurationMinutes>(3);
  const [soundType, setSoundType] = useState<SoundType>('none');
  const [scores, setScores] = useState<BodyScores>({ ...defaultScores });

  const updateScore = (key: keyof BodyScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const canStart = condition !== null;

  const handleStart = () => {
    if (!canStart) return;
    const setup = {
      condition,
      durationMinutes: duration,
      before: scores,
      soundType,
      vibrationEnabled: false,
    };
    sessionStorage.setItem('calmio_setup', JSON.stringify(setup));
    router.push('/session');
  };

  return (
    <div className="max-w-lg mx-auto px-5 pb-8">
      {/* Hero */}
      <section className="text-center pt-10 pb-8 space-y-4">
        <Image
          src="/logo.png"
          alt="Calmio"
          width={160}
          height={73}
          className="mx-auto"
          priority
        />
        <p className="text-[#FF385C] font-medium text-[15px]">
          音と呼吸で、いまの体感を整える。
        </p>
        <p className="text-[13px] text-[#717171] leading-relaxed max-w-xs mx-auto">
          セルフケアのための調整セッション &amp; 体感ログ
        </p>
      </section>

      {/* Feature chips */}
      <section className="flex justify-center gap-2.5 pb-10 flex-wrap">
        <FeatureChip
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="3分から"
        />
        <FeatureChip
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
          }
          label="呼吸ガイド"
        />
        <FeatureChip
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" />
            </svg>
          }
          label="体感を記録"
        />
      </section>

      <div className="space-y-8">
        {/* Condition */}
        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold text-[#222222] px-1">今の状態は？</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {CONDITIONS.map((c) => (
              <button
                key={c.label}
                onClick={() => setCondition(c.label)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                  condition === c.label
                    ? 'border-[#FF385C] bg-[#FFF0F3] shadow-sm'
                    : 'border-[#F0F0F0] bg-white hover:border-[#CCCCCC] hover:shadow-sm hover:bg-[#FAFAFA]'
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="text-[13px] font-medium text-[#222222]">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Duration */}
        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold text-[#222222] px-1">セッション時間</h2>
          <div className="flex gap-2.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                  duration === d
                    ? 'bg-[#FF385C] text-white shadow-sm'
                    : 'bg-white text-[#222222] border border-[#F0F0F0] hover:border-[#CCCCCC] hover:shadow-sm hover:bg-[#FAFAFA]'
                }`}
              >
                {d}分
              </button>
            ))}
          </div>
        </section>

        {/* Sound */}
        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold text-[#222222] px-1">サウンド</h2>
          <div className="flex gap-2">
            {SOUND_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSoundType(s.value)}
                className={`flex-1 py-2.5 rounded-2xl text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
                  soundType === s.value
                    ? 'bg-[#FF385C] text-white shadow-sm'
                    : 'bg-white text-[#717171] border border-[#F0F0F0] hover:border-[#CCCCCC] hover:shadow-sm hover:bg-[#FAFAFA]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Before Scores */}
        <section className="space-y-3">
          <h2 className="text-[14px] font-semibold text-[#222222] px-1">今の体感スコア</h2>
          <SectionCard className="space-y-5">
            <ScoreInput label="体の軽さ" value={scores.bodyLightness} onChange={(v) => updateScore('bodyLightness', v)} />
            <ScoreInput label="痛みの少なさ" value={scores.painRelief} onChange={(v) => updateScore('painRelief', v)} />
            <ScoreInput label="疲労の少なさ" value={scores.fatigueRelief} onChange={(v) => updateScore('fatigueRelief', v)} />
            <ScoreInput label="気分の良さ" value={scores.mood} onChange={(v) => updateScore('mood', v)} />
          </SectionCard>
        </section>

        {/* CTA */}
        <section className="pt-2">
          <PrimaryButton onClick={handleStart} disabled={!canStart}>
            調整をはじめる
          </PrimaryButton>
          {!canStart && (
            <p className="text-center text-[11px] text-[#BBBBBB] mt-2">
              まず今の状態を選んでください
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
