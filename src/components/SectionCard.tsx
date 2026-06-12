type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-[#F0F0F0] p-5 ${className}`}>
      {children}
    </div>
  );
}
