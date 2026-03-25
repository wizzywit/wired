export default function MobileTemplatePreview({ title }: { title: string }) {
  return (
    <div className="cursor-pointer rounded-xl bg-surface-container-lowest p-1 shadow-sm transition-transform active:scale-95 dark:bg-surface-container">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="px-2 pb-2">
        <span className="block text-[12px] font-bold leading-tight text-on-surface">{title}</span>
      </div>
    </div>
  );
}
