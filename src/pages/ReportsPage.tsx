import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Wrench, Building2 } from 'lucide-react'
import {
  fetchRevenueReport,
  fetchServiceRevenue,
  fetchTechnicianPerformance,
  fetchBranchComparison,
} from '../api/reports'
import type { RevenueReport, ServiceRevenueItem, TechnicianPerformanceItem, BranchRevenueItem } from '../types'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import Badge from '../components/ui/Badge'
import { inputClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

// BE nhận LocalDateTime ISO đầy đủ - input <date> chỉ cho "YYYY-MM-DD" nên
// phải nối thêm giờ: from lấy đầu ngày, to lấy cuối ngày.
function toRangeIso(dateValue: string, endOfDay: boolean) {
  return `${dateValue}T${endOfDay ? '23:59:59' : '00:00:00'}`
}

function money(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

// Thanh ngang đơn giản để so sánh trực quan giữa các dòng - không cần thêm thư viện chart.
function BarRow({ label, value, max, valueLabel }: { label: string; value: number; max: number; valueLabel: string }) {
  const percent = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 truncate text-ink-muted" title={label}>
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full rounded-full bg-suds-500" style={{ width: `${percent}%` }} />
      </div>
      <span className="tabular w-28 shrink-0 text-right font-medium text-ink">{valueLabel}</span>
    </div>
  )
}

export default function ReportsPage() {
  const { user } = useAuth()
  const isAdminTong = user?.role === 'ADMIN_TONG'

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)

  const [fromDate, setFromDate] = useState(toDateInputValue(monthAgo))
  const [toDate, setToDate] = useState(toDateInputValue(today))

  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [services, setServices] = useState<ServiceRevenueItem[]>([])
  const [technicians, setTechnicians] = useState<TechnicianPerformanceItem[]>([])
  const [branches, setBranches] = useState<BranchRevenueItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    const from = toRangeIso(fromDate, false)
    const to = toRangeIso(toDate, true)

    const requests: Promise<unknown>[] = [
      fetchRevenueReport(from, to).then(setRevenue),
      fetchServiceRevenue(from, to).then(setServices),
      fetchTechnicianPerformance(from, to).then(setTechnicians),
    ]
    if (isAdminTong) {
      requests.push(fetchBranchComparison(from, to).then(setBranches))
    }

    Promise.all(requests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải báo cáo thất bại'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [])

  const maxDailyRevenue = Math.max(0, ...(revenue?.dailyBreakdown.map((d) => d.revenue) ?? []))
  const maxServiceRevenue = Math.max(0, ...services.map((s) => s.totalRevenue))
  const maxBranchRevenue = Math.max(0, ...branches.map((b) => b.totalRevenue))

  return (
    <section>
      <PageHeader title="Báo cáo" />

      <Card className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
          className="flex flex-wrap items-end gap-4"
        >
          <Field label="Từ ngày" className="min-w-[160px]">
            <input type="date" className={inputClass} value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </Field>
          <Field label="Đến ngày" className="min-w-[160px]">
            <input type="date" className={inputClass} value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </Field>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-suds-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-suds-700"
          >
            Xem báo cáo
          </button>
        </form>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Doanh thu tổng quan */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-semibold text-ink">Doanh thu theo ngày</h3>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-sunken px-4 py-3">
                <p className="text-xs font-medium text-ink-faint">Tổng doanh thu</p>
                <p className="tabular mt-1 text-lg font-semibold text-suds-700">
                  {money(revenue?.totalRevenue ?? 0)}
                </p>
              </div>
              <div className="rounded-xl bg-surface-sunken px-4 py-3">
                <p className="text-xs font-medium text-ink-faint">Số hoá đơn</p>
                <p className="tabular mt-1 text-lg font-semibold text-ink">{revenue?.totalInvoices ?? 0}</p>
              </div>
            </div>

            {!revenue || revenue.dailyBreakdown.length === 0 ? (
              <EmptyState>Không có dữ liệu doanh thu trong khoảng thời gian này.</EmptyState>
            ) : (
              <div className="flex flex-col gap-2.5">
                {revenue.dailyBreakdown.map((d) => (
                  <BarRow
                    key={d.date}
                    label={new Date(d.date).toLocaleDateString('vi-VN')}
                    value={d.revenue}
                    max={maxDailyRevenue}
                    valueLabel={money(d.revenue)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Doanh thu theo dịch vụ */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-semibold text-ink">Doanh thu theo dịch vụ</h3>
            </div>

            {services.length === 0 ? (
              <EmptyState>Không có dữ liệu trong khoảng thời gian này.</EmptyState>
            ) : (
              <div className="flex flex-col gap-2.5">
                {services.map((s) => (
                  <BarRow
                    key={s.serviceId}
                    label={s.serviceName}
                    value={s.totalRevenue}
                    max={maxServiceRevenue}
                    valueLabel={`${money(s.totalRevenue)} · ${s.timesUsed} lượt`}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Hiệu suất thợ */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                <Wrench className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-semibold text-ink">Hiệu suất thợ</h3>
            </div>

            {technicians.length === 0 ? (
              <EmptyState>Không có dữ liệu trong khoảng thời gian này.</EmptyState>
            ) : (
              <div className={tableWrapClass}>
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Thợ</th>
                      <th className={thClass}>Số việc hoàn thành</th>
                      <th className={thClass}>TB ước lượng</th>
                      <th className={thClass}>TB thực tế</th>
                      <th className={thClass}>Tỉ lệ so với ước lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((t) => (
                      <tr key={t.technicianId} className={trHoverClass}>
                        <td className={`${tdClass} font-medium`}>{t.technicianName}</td>
                        <td className={`${tdClass} tabular`}>{t.completedCount}</td>
                        <td className={`${tdClass} tabular`}>{t.avgEstimatedMinutes.toFixed(0)} phút</td>
                        <td className={`${tdClass} tabular`}>{t.avgActualMinutes.toFixed(0)} phút</td>
                        <td className={tdClass}>
                          <Badge tone={t.actualVsEstimatedPercent <= 110 ? 'success' : 'warning'}>
                            {t.actualVsEstimatedPercent.toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* So sánh chi nhánh - chỉ Admin Tổng */}
          {isAdminTong && (
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                  <Building2 className="h-4 w-4" />
                </span>
                <h3 className="font-display text-base font-semibold text-ink">So sánh doanh thu chi nhánh</h3>
              </div>

              {branches.length === 0 ? (
                <EmptyState>Không có dữ liệu trong khoảng thời gian này.</EmptyState>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {branches.map((b) => (
                    <BarRow
                      key={b.branchId}
                      label={b.branchName}
                      value={b.totalRevenue}
                      max={maxBranchRevenue}
                      valueLabel={`${money(b.totalRevenue)} · ${b.invoiceCount} hoá đơn`}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </section>
  )
}
