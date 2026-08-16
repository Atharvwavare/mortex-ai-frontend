import { useEffect, useRef, useState, memo } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'dark' })

function MermaidDiagramInner({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(false)
  const idRef = useRef('mermaid-' + Math.random().toString(36).slice(2))

  useEffect(() => {
    let cancelled = false
    mermaid.render(idRef.current, chart)
      .then(({ svg }) => { if (!cancelled) setSvg(svg) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [chart])

  if (error) return <pre className="text-xs text-red-400 bg-[#0d0d14] p-3 rounded-lg">Could not render diagram</pre>
  if (!svg) return <div className="text-xs text-[#6b7280] py-2">Rendering diagram...</div>

  return <div className="my-2 bg-white rounded-lg p-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
}

export const MermaidDiagram = memo(MermaidDiagramInner)