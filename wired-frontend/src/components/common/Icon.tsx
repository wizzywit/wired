import type { HTMLAttributes } from 'react'

type IconProps = {
  name: string
  filled?: boolean
  size?: 'sm' | 'md' | 'lg'
} & HTMLAttributes<HTMLSpanElement>

const sizeClass = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
} as const

export function Icon({
  name,
  filled = false,
  size = 'md',
  className = '',
  style,
  ...rest
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeClass[size]} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  )
}
