import { useTheme } from './theme.js'

export default function ThemeToggle({ className = '' }) {
  const { isDarkTheme, toggleTheme } = useTheme()

  return (
    <button
      className={`theme-toggle-button ${className}`.trim()}
      type="button"
      aria-label={isDarkTheme ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      aria-pressed={isDarkTheme}
      title={isDarkTheme ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      onClick={toggleTheme}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isDarkTheme ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : (
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
        )}
      </svg>
    </button>
  )
}
