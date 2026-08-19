import { useEffect, useState, type FormEvent } from 'react'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import { fetchBranches, createBranch, updateBranch, deleteBranch, updateBranchStatus } from '../api/branches'
import { ApiError } from '../api/client'
import type { Branch } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { ACTIVE_STATUS_TONE } from '../components/ui/statusTone'
import { inputClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [editing, setEditing] = useState<Branch | null>(null)
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [deleting, setDeleting] = useState<Branch | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  function load() {
    setLoading(true)
    fetchBranches()
      .then(setBranches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createBranch({ name, address: address || undefined, phone: phone || undefined })
      setName('')
      setAddress('')
      setPhone('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo chi nhánh thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleStatus(branch: Branch) {
    const newStatus = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateBranchStatus(branch.id, newStatus)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  function openEdit(branch: Branch) {
    setEditing(branch)
    setEditName(branch.name)
    setEditAddress(branch.address ?? '')
    setEditPhone(branch.phone ?? '')
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setError(null)
    setSavingEdit(true)
    try {
      await updateBranch(editing.id, {
        name: editName,
        address: editAddress || undefined,
        phone: editPhone || undefined,
      })
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật chi nhánh thất bại')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteError(null)
    setDeletingBusy(true)
    try {
      await deleteBranch(deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      // 409: chi nhánh còn dữ liệu liên quan (user/order) - hiện lỗi ngay trong dialog xóa.
      setDeleteError(err instanceof ApiError ? err.message : 'Xóa chi nhánh thất bại')
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <section>
      <PageHeader title="Quản lý chi nhánh" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <Field label="Tên chi nhánh" className="min-w-[200px] flex-1">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Địa chỉ" className="min-w-[200px] flex-1">
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="Điện thoại" className="min-w-[160px]">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" loading={submitting}>
            <Plus className="h-4 w-4" />
            {submitting ? 'Đang tạo...' : 'Thêm chi nhánh'}
          </Button>
        </form>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : branches.length === 0 ? (
        <EmptyState>Chưa có chi nhánh nào.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>ID</th>
                <th className={thClass}>Tên</th>
                <th className={thClass}>Địa chỉ</th>
                <th className={thClass}>Điện thoại</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className={trHoverClass}>
                  <td className={`${tdClass} tabular text-ink-faint`}>{b.id}</td>
                  <td className={`${tdClass} font-medium`}>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-ink-faint" />
                      {b.name}
                    </span>
                  </td>
                  <td className={tdClass}>{b.address || '—'}</td>
                  <td className={`${tdClass} tabular`}>{b.phone || '—'}</td>
                  <td className={tdClass}>
                    <Badge tone={ACTIVE_STATUS_TONE[b.status]}>
                      {b.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(b)}>
                        {b.status === 'ACTIVE' ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger-bg"
                        onClick={() => {
                          setDeleting(b)
                          setDeleteError(null)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Sửa chi nhánh" onClose={() => setEditing(null)}>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <Field label="Tên chi nhánh">
              <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </Field>
            <Field label="Địa chỉ">
              <input className={inputClass} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </Field>
            <Field label="Điện thoại">
              <input className={inputClass} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={savingEdit} className="flex-1">
                Lưu thay đổi
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Huỷ
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa chi nhánh?"
          description={`Bạn sắp xóa chi nhánh "${deleting.name}". Hành động này không thể hoàn tác.`}
          loading={deletingBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  )
}
