type Props = {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function PrimaryButton({ onClick, disabled, children, className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl text-[15px] font-semibold transition-all duration-150 ${
        disabled
          ? 'bg-[#E8E8E8] text-[#BBBBBB] cursor-not-allowed'
          : 'bg-[#FF385C] text-white shadow-md cursor-pointer hover:bg-[#E8304F] hover:shadow-lg active:scale-[0.97]'
      } ${className}`}
    >
      {children}
    </button>
  );
}
