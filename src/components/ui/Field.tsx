import type { ReactNode } from 'react'
import { labelTextClass } from './styles'

export default function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={labelTextClass}>{label}</span>
      {children}
    </label>
  )
}
