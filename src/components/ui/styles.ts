// Các class Tailwind dùng chung cho input/table, gom 1 chỗ để đồng bộ toàn app.

export const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition focus:border-suds-400 focus:outline-none focus:ring-2 focus:ring-suds-100 disabled:cursor-not-allowed disabled:opacity-60'

export const selectClass = inputClass + ' appearance-none bg-[url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%235B6472" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>\')] bg-no-repeat bg-[right_0.65rem_center] pr-9'

export const labelTextClass = 'text-xs font-medium text-ink-muted'

export const tableWrapClass = 'overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]'

export const tableClass = 'w-full min-w-max border-collapse text-sm'

export const thClass =
  'whitespace-nowrap border-b border-border bg-surface-sunken px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted'

export const tdClass = 'border-b border-border px-4 py-3 align-middle text-ink'

export const trHoverClass = 'transition-colors hover:bg-surface-sunken/60'
