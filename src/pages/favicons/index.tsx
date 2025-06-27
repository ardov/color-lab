import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { useState, FormEvent } from 'react'

const theme = makeTheme({})

interface FaviconCard {
  size: number
  url: string
  domain: string
}

const SIZES = [16, 32, 48, 64, 128, 192, 256]

export default function FaviconFinder() {
  applyTheme(document.body, theme)

  const [urlInput, setUrlInput] = useState('')
  const [icons, setIcons] = useState<FaviconCard[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getFaviconUrl = (domain: string, size: number) =>
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Reset previous state
    setIcons([])
    setError('')
    setLoading(true)

    const raw = urlInput.trim()
    if (!raw) {
      setError('Please enter a domain or URL.')
      setLoading(false)
      return
    }

    // If scheme is missing, prepend https:// so URL() can parse it
    const urlWithScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

    let domain: string
    try {
      domain = new URL(urlWithScheme).hostname
    } catch {
      setError("That doesn't look like a valid URL.")
      setLoading(false)
      return
    }

    // Create favicon cards
    const faviconCards: FaviconCard[] = SIZES.map(size => ({
      size,
      url: getFaviconUrl(domain, size),
      domain,
    }))

    setIcons(faviconCards)
    setLoading(false)

    // Check if any favicons loaded after a delay
    setTimeout(() => {
      const loadedImages = document.querySelectorAll('.favicon-img')
      const successfullyLoaded = Array.from(loadedImages).some(
        img =>
          (img as HTMLImageElement).complete &&
          (img as HTMLImageElement).naturalWidth > 0
      )

      if (!successfullyLoaded && icons.length > 0) {
        setError('No favicon found for that domain.')
      }
    }, 2000)
  }

  const handleImageError = (size: number) => {
    setIcons(prev => prev.filter(icon => icon.size !== size))
  }

  const styles = {
    container: {
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: '0 auto',
      padding: '2rem',
      maxWidth: '960px',
      background: '#f8fafc',
      color: '#0f172a',
      lineHeight: '1.5',
      minHeight: '100vh',
    },
    title: {
      fontSize: '1.75rem',
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    form: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
    },
    input: {
      flex: '1 1 280px',
      padding: '0.6rem 0.8rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      fontSize: '1rem',
    },
    button: {
      padding: '0.6rem 1.2rem',
      background: '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background 0.2s ease-in-out',
      whiteSpace: 'nowrap' as const,
    },
    buttonHover: {
      background: '#1d4ed8',
    },
    buttonDisabled: {
      background: '#94a3b8',
      cursor: 'not-allowed',
    },
    iconsGrid: {
      marginTop: '1.5rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
    },
    iconCard: {
      background: '#fff',
      borderRadius: '0.75rem',
      padding: '1rem',
      textAlign: 'center' as const,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.15s ease',
    },
    iconImage: {
      maxWidth: '64px',
      maxHeight: '64px',
      width: 'auto',
      height: 'auto',
      display: 'block',
      margin: '0 auto 0.5rem auto',
      imageRendering: '-webkit-optimize-contrast' as any,
    },
    error: {
      color: '#dc2626',
      marginTop: '1rem',
      textAlign: 'center' as const,
    },
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Favicon Finder</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="example.com"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          required
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Loading...' : 'Get Favicons'}
        </button>
      </form>

      {icons.length > 0 && (
        <div style={styles.iconsGrid}>
          {icons.map(icon => (
            <div
              key={icon.size}
              style={styles.iconCard}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
              }}
            >
              <a
                href={icon.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  className="favicon-img"
                  src={icon.url}
                  alt={`${icon.domain} favicon ${icon.size}×${icon.size}`}
                  style={styles.iconImage}
                  onError={() => handleImageError(icon.size)}
                  loading="lazy"
                />
                <div>
                  {icon.size}×{icon.size}
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}
