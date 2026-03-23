import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

type SearchFieldProps = {
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export function SearchField({ className = '', ...rest }: SearchFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
        <Icon name="search" className="text-outline" size="sm" />
      </div>
      <input
        className="w-full rounded-xl border-none bg-surface-container-high py-3 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline/60 transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10"
        type="search"
        {...rest}
      />
    </div>
  )
}
