import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
  menuPlacement = 'bottom',
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (next: T) => void;
  disabled?: boolean;
  className?: string;
  menuPlacement?: 'bottom' | 'top';
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-full w-full items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-high px-3 text-left text-sm text-on-surface disabled:opacity-50"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <Icon name="expand_more" size="sm" className="text-on-surface-variant" />
      </button>
      {open ? (
        <div
          className={`absolute left-0 z-10 min-w-full overflow-hidden rounded-xl border border-outline-variant/20 bg-surface shadow-lg ${
            menuPlacement === 'top' ? 'bottom-[calc(100%+0.25rem)]' : 'top-[calc(100%+0.25rem)]'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-surface-container-high ${
                option.value === value ? 'text-primary' : 'text-on-surface'
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? <Icon name="check" size="sm" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
