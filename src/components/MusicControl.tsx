interface MusicControlProps {
  isPlaying: boolean
  unavailable?: boolean
  onToggle: () => void
}

export function MusicControl({ isPlaying, unavailable = false, onToggle }: MusicControlProps) {
  const label = unavailable
    ? 'Musik belum tersedia'
    : isPlaying
      ? 'Pause musik'
      : 'Putar musik'

  return (
    <button
      className={`music-control ${isPlaying ? 'is-playing' : 'is-paused'} ${unavailable ? 'is-unavailable' : ''}`}
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={isPlaying}
      title={label}
    >
      <span className="music-control__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path
            d="M9.25 17.25V6.5l9-1.75v9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.25 9.25 18.25 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <ellipse cx="6.75" cy="17.55" rx="2.55" ry="1.85" fill="currentColor" />
          <ellipse cx="15.75" cy="14.55" rx="2.55" ry="1.85" fill="currentColor" />
        </svg>
      </span>

      <span className="music-control__state" aria-hidden="true">
        {isPlaying ? (
          <>
            <i />
            <i />
            <i />
          </>
        ) : (
          <span className="music-control__play-mark">▶</span>
        )}
      </span>
    </button>
  )
}
