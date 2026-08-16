import { Star } from './Logo'
import { useSettings } from '../context/SettingsContext'

export function SplashScreen({ onNext }: { onNext: () => void }) {
  const { accent } = useSettings()
  
  return (
    <div 
      key={accent} // This forces re-render when accent changes
      className="flex flex-col items-center justify-between min-h-screen px-6 py-16" 
      style={{ background: 'var(--bg-app)' }}
    >
      <div />
      <div className="flex flex-col items-center gap-5 text-center">
        <Star size={56} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ 
            fontFamily: "'Fraunces', serif", 
            color: 'var(--text-primary)' 
          }}>
            Mortex AI
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Chat, translate, optimize code, and generate startup ideas
          </p>
        </div>
      </div>
      <button 
        onClick={onNext}
        className="w-full max-w-sm py-4 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:opacity-90 active:opacity-80"
        style={{ 
          background: accent,
          boxShadow: `0 4px 20px ${accent}40`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        Get started
      </button>
    </div>
  )
}