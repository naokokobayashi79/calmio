'use client';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

export default function ScoreInput({ label, value, onChange }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-medium text-[#222222]">{label}</span>
        <span className="text-[13px] font-bold text-[#FF385C] tabular-nums">{value}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded-lg text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
              n <= value
                ? 'bg-[#FF385C] text-white shadow-sm hover:bg-[#E8304F]'
                : 'bg-[#F5F5F5] text-[#BBBBBB] hover:bg-[#E8E8E8] hover:text-[#999999]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
