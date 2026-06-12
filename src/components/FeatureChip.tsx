type Props = {
  icon: React.ReactNode;
  label: string;
};

export default function FeatureChip({ icon, label }: Props) {
  return (
    <div className="flex items-center gap-2.5 px-5">
      <div className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#FF385C] shrink-0">
        {icon}
      </div>
      <span className="text-[13px] font-medium text-[#222222] whitespace-nowrap">{label}</span>
    </div>
  );
}
