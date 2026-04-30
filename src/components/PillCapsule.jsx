/**
 * PillCapsule — pastilla animada con gradiente de color
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * color: nombre del color (red, blue, yellow, green, purple, orange, pink, cyan)
 * label: texto opcional debajo
 * animate: si flota o no
 */

const PILL_COLORS = {
  red:    { a: '#FF6B6B', b: '#FF9999', glow: 'rgba(255,107,107,0.4)' },
  blue:   { a: '#4A90D9', b: '#7BB3F0', glow: 'rgba(74,144,217,0.4)'  },
  yellow: { a: '#FFD93D', b: '#FFE87A', glow: 'rgba(255,217,61,0.4)'  },
  green:  { a: '#6BCB77', b: '#96E89F', glow: 'rgba(107,203,119,0.4)' },
  purple: { a: '#B48ACA', b: '#CDB0DF', glow: 'rgba(180,138,202,0.4)' },
  orange: { a: '#FF9F43', b: '#FFBF80', glow: 'rgba(255,159,67,0.4)'  },
  pink:   { a: '#FF6EB4', b: '#FFA0D0', glow: 'rgba(255,110,180,0.4)' },
  cyan:   { a: '#48CAE4', b: '#90E0F3', glow: 'rgba(72,202,228,0.4)'  },
  teal:   { a: '#00C9A7', b: '#4DDEC5', glow: 'rgba(0,201,167,0.4)'   },
}

const SIZES = {
  sm: { w: 40,  h: 18, rx: 9,  fontSize: 9  },
  md: { w: 60,  h: 26, rx: 13, fontSize: 11 },
  lg: { w: 80,  h: 34, rx: 17, fontSize: 13 },
  xl: { w: 110, h: 46, rx: 23, fontSize: 16 },
}

export default function PillCapsule({
  color = 'blue',
  size = 'md',
  label,
  animate = false,
  className = '',
  style = {},
}) {
  const c = PILL_COLORS[color] ?? PILL_COLORS.blue
  const s = SIZES[size]
  const gradId = `pill-grad-${color}-${size}`
  const shadowId = `pill-shadow-${color}-${size}`

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${
        animate ? 'animate-float pill-pulse' : ''
      } ${className}`}
      style={style}
    >
      <svg
        width={s.w}
        height={s.h}
        viewBox={`0 0 ${s.w} ${s.h}`}
        className="pill-capsule"
        style={{ filter: `drop-shadow(0 3px 8px ${c.glow})` }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={c.a} />
            <stop offset="50%"  stopColor={c.b} />
            <stop offset="100%" stopColor={c.a} />
          </linearGradient>
          <linearGradient id={`${gradId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Cuerpo de la pastilla */}
        <rect
          x="1" y="1"
          width={s.w - 2}
          height={s.h - 2}
          rx={s.rx}
          fill={`url(#${gradId})`}
        />

        {/* Línea divisora central */}
        <line
          x1={s.w / 2} y1="3"
          x2={s.w / 2} y2={s.h - 3}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1.5"
        />

        {/* Brillo superior */}
        <rect
          x="1" y="1"
          width={s.w - 2}
          height={(s.h - 2) / 2}
          rx={s.rx}
          fill={`url(#${gradId}-shine)`}
        />
      </svg>

      {label && (
        <span
          className="font-sans font-semibold tracking-wide text-center"
          style={{ fontSize: s.fontSize, color: c.a }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

/** Pastilla de fondo decorativa (para la pantalla de login) */
export function BgPill({ color, size, style, animationClass }) {
  return (
    <div
      className={`bg-pill ${animationClass}`}
      style={style}
    >
      <PillCapsule color={color} size={size} />
    </div>
  )
}
