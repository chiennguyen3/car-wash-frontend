import { useEffect, useState, type FormEvent } from 'react'
import { Package, Plus, ArrowDownToLine, ArrowUpFromLine, History, AlertTriangle } from 'lucide-react'
import { fetchInventory, createInventoryItem, stockIn, stockOut, fetchInventoryTransactions } from '../api/inventory'
import type { InventoryItem, InventoryTransaction } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { inputClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

type StockAction = { item: InventoryItem; direction: 'IN' | 'OUT' }

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [unitPrice, setUnitPrice] = useState('')
  const [minQuantityAlert, setMinQuantityAlert] = useState('5')
  const [submitting, setSubmitting] = useState(false)

  const [stockAction, setStockAction] = useState<StockAction | null>(null)
  const [stockQuantity, setStockQuantity] = useState('1')
  const [stockOrderId, setStockOrderId] = useState('')
  const [stockError, setStockError] = useState<string | null>(null)
  const [stockSubmitting, setStockSubmitting] = useState(false)

  const [history, setHistory] = useState<{ item: InventoryItem; transactions: InventoryTransaction[] } | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  function load() {
    setLoading(true)
    fetchInventory()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createInventoryItem({
        name,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        minQuantityAlert: Number(minQuantityAlert),
      })
      setName('')
      setQuantity('0')
      setUnitPrice('')
      setMinQuantityAlert('5')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo vật tư thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStockSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stockAction) return
    setStockError(null)
    setStockSubmitting(true)
    try {
      if (stockAction.direction === 'IN') {
        await stockIn(stockAction.item.id, Number(stockQuantity))
      } else {
        await stockOut(stockAction.item.id, Number(stockQuantity), stockOrderId ? Number(stockOrderId) : undefined)
      }
      setStockAction(null)
      setStockQuantity('1')
      setStockOrderId('')
      load()
    } catch (err) {
      // Xuất kho vượt tồn kho hiện có -> BE trả lỗi nghiệp vụ, hiện ngay trong modal.
      setStockError(err instanceof Error ? err.message : 'Cập nhật tồn kho thất bại')
    } finally {
      setStockSubmitting(false)
    }
  }

  function openHistory(item: InventoryItem) {
    setLoadingHistory(true)
    setHistory({ item, transactions: [] })
    fetchInventoryTransactions(item.id)
      .then((transactions) => setHistory({ item, transactions }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải lịch sử thất bại'))
      .finally(() => setLoadingHistory(false))
  }

  return (
    <section>
      <PageHeader title="Quản lý kho" />

      <Card className="mb-6">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <Field label="Tên vật tư" className="min-w-[200px] flex-1">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Tồn kho ban đầu" className="min-w-[140px]">
            <input type="number" min={0} className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </Field>
          <Field label="Đơn giá" className="min-w-[140px]">
            <input type="number" min={0} className={inputClass} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
          </Field>
          <Field label="Ngưỡng cảnh báo thấp" className="min-w-[160px]">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={minQuantityAlert}
              onChange={(e) => setMinQuantityAlert(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" variant="primary" loading={submitting}>
            <Plus className="h-4 w-4" />
            {submitting ? 'Đang tạo...' : 'Thêm vật tư'}
          </Button>
        </form>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState>Chưa có vật tư nào trong kho.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Tên vật tư</th>
                <th className={thClass}>Tồn kho</th>
                <th className={thClass}>Đơn giá</th>
                <th className={thClass}>Ngưỡng cảnh báo</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={trHoverClass}>
                  <td className={`${tdClass} font-medium`}>
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-ink-faint" />
                      {item.name}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="tabular font-medium">{item.quantity}</span>
                    {item.lowStock && (
                      <Badge tone="danger">
                        <AlertTriangle className="h-3 w-3" />
                        Sắp hết
                      </Badge>
                    )}
                  </td>
                  <td className={`${tdClass} tabular`}>{item.unitPrice.toLocaleString('vi-VN')}đ</td>
                  <td className={`${tdClass} tabular text-ink-muted`}>{item.minQuantityAlert}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setStockAction({ item, direction: 'IN' })
                          setStockError(null)
                        }}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        Nhập
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setStockAction({ item, direction: 'OUT' })
                          setStockError(null)
                        }}
                      >
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                        Xuất
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openHistory(item)}>
                        <History className="h-3.5 w-3.5" />
                        Lịch sử
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stockAction && (
        <Modal
          title={stockAction.direction === 'IN' ? 'Nhập kho' : 'Xuất kho'}
          onClose={() => setStockAction(null)}
        >
          <form onSubmit={handleStockSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-ink-muted">
              Vật tư: <span className="font-medium text-ink">{stockAction.item.name}</span> — tồn hiện tại:{' '}
              <span className="tabular font-medium text-ink">{stockAction.item.quantity}</span>
            </p>
            <Field label="Số lượng">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
            </Field>
            {stockAction.direction === 'OUT' && (
              <Field label="Mã đơn hàng liên quan (không bắt buộc)">
                <input
                  type="number"
                  className={inputClass}
                  value={stockOrderId}
                  onChange={(e) => setStockOrderId(e.target.value)}
                  placeholder="VD: 12"
                />
              </Field>
            )}
            {stockError && <ErrorBanner>{stockError}</ErrorBanner>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={stockSubmitting} className="flex-1">
                Xác nhận
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStockAction(null)}>
                Huỷ
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {history && (
        <Modal title={`Lịch sử: ${history.item.name}`} onClose={() => setHistory(null)} size="lg">
          {loadingHistory ? (
            <LoadingBlock />
          ) : history.transactions.length === 0 ? (
            <EmptyState>Chưa có giao dịch nào.</EmptyState>
          ) : (
            <div className={tableWrapClass}>
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Loại</th>
                    <th className={thClass}>Số lượng</th>
                    <th className={thClass}>Tồn sau GD</th>
                    <th className={thClass}>Đơn hàng</th>
                    <th className={thClass}>Người thực hiện</th>
                    <th className={thClass}>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {history.transactions.map((t) => (
                    <tr key={t.id} className={trHoverClass}>
                      <td className={tdClass}>
                        <Badge tone={t.type === 'NHAP' ? 'success' : 'warning'}>
                          {t.type === 'NHAP' ? 'Nhập' : 'Xuất'}
                        </Badge>
                      </td>
                      <td className={`${tdClass} tabular`}>{t.quantity}</td>
                      <td className={`${tdClass} tabular`}>{t.quantityAfter}</td>
                      <td className={`${tdClass} tabular`}>{t.orderId ?? '—'}</td>
                      <td className={tdClass}>{t.createdByName}</td>
                      <td className={`${tdClass} tabular text-ink-muted`}>
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </section>
  )
}
