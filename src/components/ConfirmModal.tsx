import { Portal } from './Portal'

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string
  onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60" onClick={onCancel}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 bg-[#1a1a24] border border-white/10 shadow-2xl">
          <h3 className="text-white font-semibold text-[15px] mb-1.5">{title}</h3>
          <p className="text-[#9ca3af] text-[13px] leading-relaxed mb-5">{message}</p>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] text-[#9ca3af] hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-600 hover:bg-red-500 text-white transition-colors">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}