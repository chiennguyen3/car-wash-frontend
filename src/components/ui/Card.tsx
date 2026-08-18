import type { HTMLAttributes } from 'react'

export default function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
