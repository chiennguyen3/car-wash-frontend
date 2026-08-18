import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchRevenueReport,
  fetchServiceRevenue,
  fetchTechnicianPerformance,
  fetchBranchComparison,
} from '../api/reports'
import type { RevenueReport, ServiceRevenueItem, TechnicianPerformanceItem, BranchRevenueItem } from '../types'

function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01T00:00:00`
}
function now() {
  return new Date().toISOString().slice(0, 19)
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [from, setFrom] = useState(firstDayOfMonth())
  const [to, setTo] = useState(now())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [byService, setByService] = useState<ServiceRevenueItem[]>([])
  const [byTechnician, setByTechnician] = useState<TechnicianPerformanceItem[]>([])
  const [byBranch, setByBranch] = useState<BranchRevenueItem[]>([])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const [rev, svc, tech] = await Promise.all([
        fetchRevenueReport(from, to),
        fetchServiceRevenue(from, to),
        fetchTechnicianPerformance(from, to),
      ])
      setRevenue(rev)
      setByService(svc)
      setByTechnician(tech)

      if (user?.role === 'ADMIN_TONG') {
        setByBranch(await fetchBranchComparison(from, to))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải báo cáo thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Báo cáo</h2>

      <form onSubmit={handleSubmit} className="form form-inline">
        <label>
          Từ ngày
          <input type="datetime-local" value={from.slice(0, 16)} onChange={(e) => setFrom(e.target.value + ':00')} />
        </label>
        <label>
          Đến ngày
          <input type="datetime-local" value={to.slice(0, 16)} onChange={(e) => setTo(e.target.value + ':00')} />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Đang tải...' : 'Xem báo cáo'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {revenue && (
        <>
          <div className="report-summary">
            <div className="stat-card">
              <p className="stat-label">Tổng doanh thu</p>
              <p className="stat-value">{revenue.totalRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Số hoá đơn</p>
              <p className="stat-value">{revenue.totalInvoices}</p>
            </div>
          </div>

          <h3>Doanh thu theo ngày</h3>
          <table className="data-table">
            <thead><tr><th>Ngày</th><th>Doanh thu</th><th>Số hoá đơn</th></tr></thead>
            <tbody>
              {revenue.dailyBreakdown.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.revenue.toLocaleString('vi-VN')}đ</td>
                  <td>{d.invoiceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Doanh thu theo dịch vụ</h3>
          <table className="data-table">
            <thead><tr><th>Dịch vụ</th><th>Doanh thu</th><th>Số lần dùng</th></tr></thead>
            <tbody>
              {byService.map((s) => (
                <tr key={s.serviceId}>
                  <td>{s.serviceName}</td>
                  <td>{s.totalRevenue.toLocaleString('vi-VN')}đ</td>
                  <td>{s.timesUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Hiệu suất thợ</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Thợ</th><th>Số việc hoàn thành</th><th>TB ước lượng (phút)</th>
                <th>TB thực tế (phút)</th><th>So với ước lượng</th>
              </tr>
            </thead>
            <tbody>
              {byTechnician.map((t) => (
                <tr key={t.technicianId}>
                  <td>{t.technicianName}</td>
                  <td>{t.completedCount}</td>
                  <td>{t.avgEstimatedMinutes.toFixed(1)}</td>
                  <td>{t.avgActualMinutes.toFixed(1)}</td>
                  <td>{t.actualVsEstimatedPercent.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {user?.role === 'ADMIN_TONG' && (
            <>
              <h3>So sánh doanh thu chi nhánh</h3>
              <table className="data-table">
                <thead><tr><th>Chi nhánh</th><th>Doanh thu</th><th>Số hoá đơn</th></tr></thead>
                <tbody>
                  {byBranch.map((b) => (
                    <tr key={b.branchId}>
                      <td>{b.branchName}</td>
                      <td>{b.totalRevenue.toLocaleString('vi-VN')}đ</td>
                      <td>{b.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </section>
  )
}