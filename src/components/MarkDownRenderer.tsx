import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkDownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const codeString = String(children).replace(/\n$/, '')
      const isInline = !match || !codeString.includes('\n')
      
      // Extract only the props that SyntaxHighlighter can use
      const { node, ...syntaxProps } = props as any
      
      if (!isInline && match) {
        try {
          return (
            <div className="rounded-lg my-2 overflow-hidden" style={{
              border: '1px solid var(--border-default)',
              background: '#0d1117'
            }}>
              <div className="px-4 py-1.5 text-xs font-medium flex items-center justify-between" style={{
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border-default)',
                background: 'var(--bg-surface-2)'
              }}>
                <span>{match[1]}</span>
                <span className="opacity-50">code</span>
              </div>
              <SyntaxHighlighter
                language={match[1]}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          )
        } catch (error) {
          // Fallback if syntax highlighting fails
          return (
            <pre className="rounded-lg my-2 p-4 overflow-x-auto" style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              lineHeight: '1.6'
            }}>
              <code className={className}>
                {children}
              </code>
            </pre>
          )
        }
      }
      
      // Inline code
      return (
        <code 
          className="px-1.5 py-0.5 rounded text-sm" 
          style={{ 
            background: 'var(--bg-surface-2)',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          {children}
        </code>
      )
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-3">
          <table className="min-w-full border-collapse text-sm" style={{
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)'
          }}>
            {children}
          </table>
        </div>
      )
    },
    th({ children }) {
      return (
        <th className="px-4 py-2.5 text-left font-semibold" style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface-2)',
          color: 'var(--text-primary)'
        }}>
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="px-4 py-2.5 text-left" style={{
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)'
        }}>
          {children}
        </td>
      )
    },
    a({ href, children }) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:opacity-80 transition-opacity"
          style={{
            color: 'var(--accent)',
            textDecoration: 'underline'
          }}
        >
          {children}
        </a>
      )
    },
    blockquote({ children }) {
      return (
        <blockquote 
          className="pl-4 my-3 border-l-4" 
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}
        >
          {children}
        </blockquote>
      )
    },
    ul({ children }) {
      return (
        <ul className="list-disc pl-6 my-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </ul>
      )
    },
    ol({ children }) {
      return (
        <ol className="list-decimal pl-6 my-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </ol>
      )
    },
    li({ children }) {
      return (
        <li className="my-0.5" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </li>
      )
    },
    h1({ children }) {
      return (
        <h1 className="text-3xl font-bold my-4" style={{ color: 'var(--text-primary)' }}>
          {children}
        </h1>
      )
    },
    h2({ children }) {
      return (
        <h2 className="text-2xl font-semibold my-3" style={{ color: 'var(--text-primary)' }}>
          {children}
        </h2>
      )
    },
    h3({ children }) {
      return (
        <h3 className="text-xl font-semibold my-2.5" style={{ color: 'var(--text-primary)' }}>
          {children}
        </h3>
      )
    },
    h4({ children }) {
      return (
        <h4 className="text-lg font-semibold my-2" style={{ color: 'var(--text-primary)' }}>
          {children}
        </h4>
      )
    },
    p({ children }) {
      return (
        <p className="my-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </p>
      )
    },
    hr() {
      return (
        <hr className="my-6" style={{ borderColor: 'var(--border-default)' }} />
      )
    },
    img({ src, alt }) {
      return (
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full rounded-lg my-3"
          style={{ border: '1px solid var(--border-default)' }}
        />
      )
    }
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}