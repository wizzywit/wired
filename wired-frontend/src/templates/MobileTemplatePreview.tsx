export default function MobileTemplatePreview({
  title,
  onClick,
  disabled,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-surface-container-lowest p-1 text-left shadow-sm transition-transform enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-container"
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="px-2 pb-2">
        <span className="block text-[12px] font-bold leading-tight text-on-surface">{title}</span>
      </div>
    </button>
  );
}
