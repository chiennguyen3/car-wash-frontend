import { useEffect, useState, type FormEvent } from 'react'
import { fetchInventory, createInventoryItem, stockIn, stockOut, fetchInventoryTransactions } from '../api/inventory'
import type { InventoryItem, InventoryTransaction } from '../types'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [unitPrice, setUnitPrice] = useState('')
  const [minQuantityAlert, setMinQuantityAlert] = useState('10')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  const [stockForm, setStockForm] = useState<{ item: InventoryItem; type: 'in' | 'out' } | null>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [submittingStock, setSubmittingStock] = useState(false)

  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null)
  const [history, setHistory] = useState<InventoryTransaction[]>([])

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
    setSubmittingCreate(true)
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
      setMinQuantityAlert('10')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo mặt hàng thất bại')
    } finally {
      setSubmittingCreate(false)
    }
  }

  async function handleStockSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stockForm) return
    setError(null)
    setSubmittingStock(true)
    try {
      if (stockForm.type === 'in') {
        await stockIn(stockForm.item.id, Number(stockQuantity))
      } else {
        await stockOut(stockForm.item.id, Number(stockQuantity))
      }
      setStockForm(null)
      setStockQuantity('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật kho thất bại')
    } finally {
      setSubmittingStock(false)
    }
  }

  function openHistory(item: InventoryItem) {
    setHistoryItem(item)
    fetchInventoryTransactions(item.id).then(setHistory).catch((err) => setError(err.message))
  }

  return (
    <section>
      <h2>Tồn kho linh kiện</h2>

      <form onSubmit={handleCreate} className="form form-inline">
        <label>
          Tên linh kiện
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Số lượng ban đầu
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label>
          Đơn giá
          <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
        </label>
        <label>
          Ngưỡng cảnh báo
          <input type="number" min={0} value={minQuantityAlert} onChange={(e) => setMinQuantityAlert(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary" disabled={submittingCreate}>
          {submittingCreate ? 'Đang tạo...' : 'Thêm mặt hàng'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Tồn kho</th>
              <th>Đơn giá</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>
                  {it.name}
                  {it.lowStock && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Sắp hết</span>}
                </td>
                <td>{it.quantity}</td>
                <td>{it.unitPrice.toLocaleString('vi-VN')}đ</td>
                <td className="actions">
                  <button type="button" onClick={() => setStockForm({ item: it, type: 'in' })}>Nhập kho</button>
                  <button type="button" onClick={() => setStockForm({ item: it, type: 'out' })}>Xuất kho</button>
                  <button type="button" onClick={() => openHistory(it)}>Lịch sử</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">Chưa có linh kiện nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {stockForm && (
        <div className="modal-overlay" onClick={() => setStockForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{stockForm.type === 'in' ? 'Nhập kho' : 'Xuất kho'}: {stockForm.item.name}</h3>
            <p className="muted">Tồn kho hiện tại: {stockForm.item.quantity}</p>
            <form onSubmit={handleStockSubmit} className="form">
              <label>
                Số lượng
                <input
                  type="number"
                  min={1}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </label>
              {error && <p className="error">{error}</p>}
              <div className="form-row">
                <button type="submit" className="btn-primary" disabled={submittingStock}>
                  {submittingStock ? 'Đang lưu...' : 'Xác nhận'}
                </button>
                <button type="button" onClick={() => setStockForm(null)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyItem && (
        <div className="modal-overlay" onClick={() => setHistoryItem(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>Lịch sử: {historyItem.name}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>SL</th>
                  <th>Tồn sau</th>
                  <th>Người thực hiện</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.type === 'NHAP' ? 'Nhập' : 'Xuất'}</td>
                    <td>{h.quantity}</td>
                    <td>{h.quantityAfter}</td>
                    <td>{h.createdByName}</td>
                    <td>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => setHistoryItem(null)} style={{ marginTop: 12 }}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  )
}