import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { inputClass } from './styles'

interface ComboboxOption<T extends string> {
  value: T
  label: string
}

interface ComboboxProps<T extends string> {
  options: ComboboxOption<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder?: string
}

// Combobox gõ-để-lọc đơn giản, không phụ thuộc thư viện ngoài.
// Dùng cho danh sách ngắn (loại xe, dịch vụ...) cần gõ nhanh thay vì
// cuộn dropdown dài.
export default function Combobox<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Tìm và chọn...',
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`${inputClass} flex items-center justify-between text-left`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selectedLabel ? '' : 'text-ink-faint'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          <input
            autoFocus
            className="w-full border-b border-border px-3 py-2 text-sm outline-none"
            placeholder="Gõ để tìm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((o) => (
              <li
                key={o.value}
                className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-suds-50"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                  setQuery('')
                }}
              >
                {o.label}
                {o.value === value && <Check className="h-4 w-4 text-suds-600" />}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-ink-faint">Không tìm thấy.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}