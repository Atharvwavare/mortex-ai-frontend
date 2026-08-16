export function MicButton({ listening, levels, onClick }: { listening: boolean; levels: number[]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 overflow-hidden"
      style={{ background: listening ? '#ef4444' : '#242433' }}
      title={listening ? 'Stop listening' : 'Speak your message'}
    >
      {listening ? (
        <div className="flex items-end gap-[1.5px] h-4">
          {levels.slice(0, 6).map((v, i) => (
            <span
              key={i}
              className="w-[2px] bg-white rounded-full transition-all duration-75"
              style={{ height: `${Math.max(3, v * 16)}px` }}
            />
          ))}
        </div>
      ) : (
        <span className="text-[#9ca3af] text-sm">🎤</span>
      )}
    </button>
  )
}