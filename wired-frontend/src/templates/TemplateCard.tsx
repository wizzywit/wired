import { Icon } from '../components/common/Icon';

export default function TemplateCard({
  icon,
  title,
  subtitle,
  bg,
  accent,
  text,
  sub,
  onClick,
  disabled,
}: {
  icon: string;
  title: string;
  subtitle: string;
  bg: string;
  accent: string;
  text: string;
  sub: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex h-60 w-64 flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-6 text-left shadow-sm transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${bg}`}
    >
      <div
        className={`absolute -bottom-4 -right-4 h-32 w-32 rounded-full blur-2xl transition-transform group-hover:scale-125 ${accent}`}
      />
      <Icon name={icon} className={`mb-4 ${text}`} />
      <h3 className={`text-lg font-bold leading-tight ${text}`}>{title}</h3>
      <p className={`mt-2 text-sm ${sub}`}>{subtitle}</p>
    </button>
  );
}
