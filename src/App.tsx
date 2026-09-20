import { useState, useRef, useEffect, useCallback } from 'react'

import cherryBlossoms from './assets/cherryBlossoms.png'
import polaroidTulips from './assets/ref2.jpg'
import ginghamFrame from './assets/ginghamFrame.png'
import ginghamBow from './assets/ginghamBow.png'
import plumBranch from './assets/plumBranch.png'
import filmCollage from './assets/ref7.jpg'
import prayerPhoto from './assets/ref8.jpg'
import couplePhoto from './assets/ref9.jpg'
import gardenPhoto from './assets/ref10.jpg'
import candleVideo from './imports/istockphoto-1355977124-640_adpp_is.mp4'
import filmStripImage from './imports/image.png'
import timilaiMusic from './assets/timilai.mp3'

// ── Constants ────────────────────────────────────────────

const SPREADS: ([number, number])[] = [
  [-1, 0],  // 0: Cover
  [1, 2],   // 1: Dedication (L), 2: The Beginning (R)
  [3, 4],   // 3: Her Smile (L), 4: Prayer Flags (R)
  [5, 6],   // 5: Garden Serenity (L), 6: Under The Sky (R)
  [7, 8],   // 7: Our Journey (L), 8: Love Letter (R)
  [9, -1],  // 9: Back Cover
]
const FLIP_MS = 700
const TOTAL_PAGES = 10

// ── Hooks ────────────────────────────────────────────────

function useResponsive() {
  const getLayout = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    return {
      isMobile: w < 768,
      isSmallPhone: w < 390,
      w,
      h,
      // Book dimensions for desktop
      pageW: Math.min(320, w * 0.28),
      pageH: Math.min(500, h * 0.72),
    }
  }
  const [layout, setLayout] = useState(getLayout)
  useEffect(() => {
    const fn = () => setLayout(getLayout())
    window.addEventListener('resize', fn)
    window.addEventListener('orientationchange', fn)
    return () => {
      window.removeEventListener('resize', fn)
      window.removeEventListener('orientationchange', fn)
    }
  }, [])
  return layout
}

// ── SVGs ─────────────────────────────────────────────────

function PaperclipSVG() {
  return (
    <svg width="22" height="52" viewBox="0 0 22 52" fill="none">
      <path d="M11 3C7.5 3 4.5 6 4.5 9.5V37C4.5 44.5 7 49 11 49C15 49 17.5 44.5 17.5 37V9.5C17.5 6 14.5 3 11 3Z"
        stroke="#9A9A9A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M11 8C9 8 7.5 9.5 7.5 11.5V37C7.5 42 9 45 11 45C13 45 14.5 42 14.5 37V11.5C14.5 9.5 13 8 11 8Z"
        stroke="#9A9A9A" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function HeartSVG({ size = 22, color = '#6B2737' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21C12 21 3 14 3 8C3 5.24 5.24 3 8 3C9.75 3 11.29 3.78 12 4.94C12.71 3.78 14.25 3 16 3C18.76 3 21 5.24 21 8C21 14 12 21 12 21Z"/>
    </svg>
  )
}

function ChevronSVG({ dir, color = '#6B2737', size = 22 }: { dir: 'left' | 'right'; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left'
        ? <polyline points="15,18 9,12 15,6"/>
        : <polyline points="9,18 15,12 9,6"/>}
    </svg>
  )
}

function DenimStarSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <polygon points="16,2 20,12 30,12 22,19 25,29 16,23 7,29 10,19 2,12 12,12" fill="#4A6FA5"/>
    </svg>
  )
}

// ── Floating Hearts Background ───────────────────────────

function FloatingHearts() {
  const hearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 7.5) % 86}%`,
    delay: `${(i * 1.3) % 8}s`,
    duration: `${7 + (i * 1.1) % 6}s`,
    size: 10 + (i % 4) * 5,
    opacity: 0.07 + (i % 3) * 0.04,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {hearts.map(h => (
        <div key={h.id} style={{
          position: 'absolute',
          bottom: '-60px',
          left: h.left,
          fontSize: h.size,
          opacity: h.opacity,
          animation: `floatUp ${h.duration} ${h.delay} infinite ease-in`,
          color: '#F4A7B9',
        }}>♥</div>
      ))}
    </div>
  )
}

// ── Audio Player Components ───────────────────────────────

function formatAudioTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function FloatingMusicButton({
  isPlaying,
  onToggle,
  isMobile,
}: {
  isPlaying: boolean
  onToggle: () => void
  isMobile?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      style={{
        position: 'fixed',
        top: 'calc(14px + env(safe-area-inset-top, 0px))',
        right: isMobile ? 12 : 24,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: isPlaying
          ? 'linear-gradient(135deg, rgba(64, 14, 26, 0.94) 0%, rgba(107, 39, 55, 0.94) 100%)'
          : 'linear-gradient(135deg, rgba(255, 253, 248, 0.94) 0%, rgba(247, 234, 215, 0.94) 100%)',
        color: isPlaying ? '#F5DEB3' : '#6B2737',
        border: '1.5px solid rgba(201, 168, 76, 0.65)',
        borderRadius: 999,
        padding: isMobile ? '6px 12px' : '7px 16px',
        boxShadow: isPlaying
          ? '0 6px 20px rgba(107, 39, 55, 0.35), 0 2px 8px rgba(0,0,0,0.15)'
          : '0 4px 16px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animation: isPlaying ? 'none' : 'musicGlow 2.5s infinite ease-in-out',
      }}
    >
      {/* Vinyl Disc Icon */}
      <div style={{
        width: isMobile ? 22 : 24,
        height: isMobile ? 22 : 24,
        borderRadius: '50%',
        background: isPlaying
          ? 'radial-gradient(circle, #E8C97B 25%, #222 26%, #111 60%, #333 100%)'
          : 'radial-gradient(circle, #C9A84C 25%, #6B2737 26%, #4A0E1C 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isPlaying ? 'spinSlow 4s linear infinite' : 'none',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: '#FFF',
        }}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          fontFamily: 'Lato, sans-serif',
          fontSize: isMobile ? 11 : 12,
          fontWeight: 700,
          letterSpacing: 0.4,
          whiteSpace: 'nowrap',
        }}>
          {isPlaying ? 'Timilai ♪' : 'Play Song ♪'}
        </span>

        {/* Small equalizer visualizer */}
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 12, marginLeft: 2 }}>
            {[8, 12, 6, 14].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 2, height: h,
                  borderRadius: 1,
                  background: '#F5DEB3',
                  transformOrigin: 'bottom',
                  animation: `eqBar ${0.5 + i * 0.15}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function AudioPill({
  compact,
  isPlaying,
  onToggle,
  currentTime = 0,
  duration = 0,
}: {
  compact?: boolean
  isPlaying?: boolean
  onToggle?: () => void
  currentTime?: number
  duration?: number
}) {
  const bars = [5, 10, 14, 18, 12, 20, 16, 10, 7, 14, 18, 11, 8, 15, 13, 9]

  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      title={isPlaying ? 'Pause music' : 'Play Timilai - Purna Rai'}
      style={{
        display: 'flex', alignItems: 'center', gap: compact ? 7 : 9,
        background: 'linear-gradient(135deg, #FFFDF8 0%, #FAF2E4 100%)',
        border: '1.5px solid #C9A84C',
        borderRadius: 999, padding: compact ? '6px 12px' : '8px 16px',
        boxShadow: isPlaying
          ? '0 4px 16px rgba(201,168,76,0.35), 0 2px 8px rgba(107,39,55,0.15)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: compact ? 24 : 28, height: compact ? 24 : 28, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6B2737 0%, #8A2D40 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(107,39,55,0.3)',
      }}>
        {isPlaying ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <rect x="1" y="1" width="3" height="10" rx="1" />
            <rect x="6" y="1" width="3" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white" style={{ marginLeft: 1 }}>
            <path d="M1 1L9 6L1 11V1Z" />
          </svg>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 4 : 6 }}>
          <span style={{
            fontFamily: 'Lato, sans-serif', fontSize: compact ? 9.5 : 10.5,
            fontWeight: 700, color: '#3A0C16', letterSpacing: 0.3,
          }}>
            Timilai
          </span>
          <span style={{ fontSize: 9, color: '#9E7448', fontFamily: 'Lato, sans-serif' }}>
            • Purna Rai
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 2.5,
                height: h * (compact ? 0.7 : 0.85),
                borderRadius: 2,
                background: isPlaying ? '#6B2737' : '#D4A080',
                transformOrigin: 'bottom',
                animation: isPlaying ? `eqBar ${0.6 + ((i * 0.13) % 0.8)}s ease-in-out infinite` : 'none',
                animationDelay: `${(i * 0.07) % 0.5}s`,
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <span style={{
        fontSize: compact ? 9 : 10,
        color: '#8B5E3C',
        fontFamily: 'Lato, sans-serif',
        flexShrink: 0,
        fontWeight: 600,
        marginLeft: 2,
      }}>
        {formatAudioTime(currentTime)}
      </span>
    </div>
  )
}

// ── Page Components ───────────────────────────────────────

function CoverPage({
  isMobile,
  onStart,
  isPlaying,
}: {
  isMobile?: boolean
  onStart?: () => void
  isPlaying?: boolean
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(158deg, #4A0E1C 0%, #6B2737 45%, #3A000A 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', top: isMobile ? -18 : -24, left: isMobile ? -20 : -30,
        width: isMobile ? '55%' : 190, objectFit: 'contain',
        opacity: 0.8, transform: 'rotate(-12deg)', zIndex: 2,
      }}/>
      <img src={plumBranch} alt="" style={{
        position: 'absolute', top: isMobile ? -8 : -10, right: isMobile ? -16 : -24,
        width: isMobile ? '45%' : 150, objectFit: 'contain',
        opacity: 0.65, transform: 'rotate(16deg) scaleX(-1)', zIndex: 2,
      }}/>

      {/* Gold label */}
      <div style={{
        background: 'linear-gradient(135deg, #F5DEB3 0%, #E8C97B 50%, #F5DEB3 100%)',
        border: '2px solid rgba(255,255,255,0.25)',
        borderRadius: 12, padding: isMobile ? '24px 38px' : '22px 36px',
        textAlign: 'center', zIndex: 5,
        boxShadow: '0 6px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? 38 : 30, fontWeight: 700, color: '#2D0008', lineHeight: 1.1 }}>
          Hamro Maya
        </div>
        <div style={{ width: 50, height: 1, background: '#9A7040', margin: '12px auto 8px' }}/>
        <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 24 : 18, color: '#6B2737' }}>♥</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: isMobile ? 12 : 10, letterSpacing: 2, color: '#7A4E28', textTransform: 'uppercase', marginTop: 4 }}>
          Our Story
        </div>
      </div>

      <img src={ginghamBow} alt="" style={{
        position: 'absolute', bottom: isMobile ? 24 : -8, right: isMobile ? 20 : 18,
        width: isMobile ? 100 : 85, objectFit: 'contain',
        transform: 'rotate(8deg)', zIndex: 4,
      }}/>
      <img src={polaroidTulips} alt="" style={{
        position: 'absolute', bottom: isMobile ? 80 : 56, left: isMobile ? 0 : -6,
        width: isMobile ? 86 : 72, objectFit: 'contain',
        opacity: 0.8, transform: 'rotate(-9deg)', zIndex: 4,
      }}/>

      {/* Texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(255,255,255,0.03) 32px, rgba(255,255,255,0.03) 33px)',
      }}/>

      {/* Swipe hint on mobile */}
      {isMobile && (
        <div onClick={onStart} style={{ cursor: 'pointer',
          position: 'absolute', bottom: 36, left: 0, right: 0,
          textAlign: 'center', zIndex: 10,
          color: 'rgba(245,222,179,0.7)',
          fontFamily: 'Lato, sans-serif', fontSize: 11, letterSpacing: 1.5,
          animation: 'pulseHint 2s infinite',
        }}>
          swipe to begin ♥
        </div>
      )}
    </div>
  )
}

function IntroCandlePage({ onNext, onPrev, isMobile }: { onNext: () => void; onPrev: () => void; isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FCF8F2 0%, #F8EFE4 45%, #F1E2CD 100%)',
      padding: isMobile ? '24px 18px 80px' : '20px 18px',
      boxSizing: 'border-box',
    }}>
      {/* Decorative delicate gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>
      <div style={{
        position: 'absolute', inset: isMobile ? 14 : 14,
        border: '1px dashed rgba(201,168,76,0.25)',
        borderRadius: 10, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Top floral sprigs */}
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', top: -14, left: -14,
        width: isMobile ? 105 : 105, objectFit: 'contain',
        opacity: 0.85, transform: 'rotate(-10deg)', zIndex: 3, pointerEvents: 'none',
      }}/>
      <img src={ginghamBow} alt="" style={{
        position: 'absolute', top: isMobile ? 10 : 10, right: isMobile ? 14 : 14,
        width: isMobile ? 55 : 52, objectFit: 'contain',
        opacity: 0.9, transform: 'rotate(8deg)', zIndex: 5, pointerEvents: 'none',
      }}/>

      {/* Title & Dedication */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 4 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 8,
          letterSpacing: 3, textTransform: 'uppercase', color: '#9E7448',
          marginBottom: 3,
        }}>
          ✦ Chapter I ✦
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 22,
          fontWeight: 700, color: '#4A0E1C', lineHeight: 1.15,
        }}>
          Hamro Maya
        </div>
      </div>

      {/* Animated Floral Portrait Card */}
      <div style={{
        position: 'relative', zIndex: 4,
        width: isMobile ? '82%' : 210,
        maxWidth: isMobile ? 275 : 210,
        height: isMobile ? 260 : 210,
        borderRadius: '130px 130px 18px 18px',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(107,39,55,0.18), 0 2px 10px rgba(0,0,0,0.06)',
        border: '3px solid #FFF',
        background: '#FFF',
      }}>
        {/* Video of blooming watercolor florals */}
        <video
          src={candleVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Romantic poem in center of floral wreath */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '16px 20px' : '14px 16px', textAlign: 'center',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.25) 70%, transparent 100%)',
        }}>
          <div style={{ fontSize: 16, color: '#A3384D', marginBottom: 6 }}>♥</div>
          <div style={{
            fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
            fontSize: isMobile ? 13 : 11, lineHeight: 1.6,
            color: '#38161E', fontWeight: 600,
          }}>
            "Maya bashnu raixa ka ho ka bata khojna puge, samjheko ta pailai thiye tara aaile paye tmelai."
          </div>
          <div style={{
            fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 15 : 12.5,
            color: '#822B3E', marginTop: 8,
          }}>
            yeti dherai samaye paxi veteko xu, i don't wanna loose you ♥
          </div>
        </div>
      </div>

      {/* Bottom Quote & Accent */}
      <div style={{
        zIndex: 4, textAlign: 'center',
        maxWidth: isMobile ? 290 : 210,
      }}>
        <div style={{ width: 44, height: 1, background: '#C9A84C', margin: '0 auto 6px', opacity: 0.6 }}/>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12 : 10, color: '#5A2A35', lineHeight: 1.45,
        }}>
          sadhai vari tmelai dherai maya ♥
        </div>
      </div>

      {/* Corner Plum Branch */}
      <img src={plumBranch} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, left: -14,
        width: isMobile ? 85 : 80, objectFit: 'contain',
        opacity: 0.55, transform: 'rotate(12deg)', zIndex: 3, pointerEvents: 'none',
      }}/>
    </div>
  )
}

function SpreadBLeftPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FDF7F0 0%, #F7EAD7 50%, #EFE1CB 100%)',
      padding: isMobile ? '24px 18px 80px' : '20px 18px 16px',
      boxSizing: 'border-box',
    }}>
      {/* Decorative gold border frame */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>
      <div style={{
        position: 'absolute', inset: isMobile ? 14 : 14,
        border: '1px dashed rgba(201,168,76,0.25)',
        borderRadius: 10, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Top Header Stamp */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 4 : 2 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(107,39,55,0.08)',
          border: '1px solid rgba(107,39,55,0.25)',
          borderRadius: 999, padding: isMobile ? '3px 14px' : '2px 12px',
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#6B2737',
          marginBottom: 3,
        }}>
          ♥ Timro Sath ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#3A0C16',
        }}>
          You & Me
        </div>
      </div>

      {/* Main Scrapbook Photo in Gingham Floral Frame */}
      {/* Container uses frame's natural aspect ratio 736:1308 so frame fills it 1-to-1 */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? 162 : 148,
        aspectRatio: '736 / 1308',
        transform: 'rotate(-2deg)',
        filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.14))',
        flexShrink: 0,
      }}>
        {/* Photo clipped to the transparent window — pixel-exact from PNG scan */}
        <div style={{
          position: 'absolute',
          top: '27.14%', left: '13.32%',
          width: '73.91%', height: '42.66%',
          overflow: 'hidden',
          borderRadius: 3,
          zIndex: 1,
          background: '#F2EAD8',
        }}>
          <img
            src={gardenPhoto}
            alt=""
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
        </div>
        {/* Frame image fills container exactly — sits ON TOP covering photo edges */}
        <img
          src={ginghamFrame}
          alt=""
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'fill',
            zIndex: 2, pointerEvents: 'none',
          }}
        />
        {/* Sweet caption badge */}
        <div style={{
          position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
          background: '#FFFDF8', border: '1px solid #D4A080',
          borderRadius: 4, padding: isMobile ? '3px 12px' : '2px 10px', whiteSpace: 'nowrap',
          zIndex: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}>
          <span style={{
            fontFamily: 'Dancing Script, cursive',
            fontSize: isMobile ? 13 : 10.5,
            color: '#6B2737',
          }}>
            sadhai tmelai maya ♥
          </span>
        </div>
      </div>

      {/* Sweet Card */}
      <div style={{
        width: '100%', maxWidth: isMobile ? 315 : 230,
        background: 'linear-gradient(145deg, #FFFDF8, #FAF2E4)',
        border: '1.5px solid #C9A84C',
        borderRadius: 12,
        padding: isMobile ? '12px 16px' : '10px 14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        position: 'relative', zIndex: 4,
        textAlign: 'center',
        marginTop: isMobile ? 6 : 4,
      }}>
        <div style={{
          fontFamily: 'Dancing Script, cursive',
          fontSize: isMobile ? 18 : 15,
          color: '#6B2737',
          fontWeight: 700,
          marginBottom: 6,
        }}>
          Tme Ra Ma ♥
        </div>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10.5,
          color: '#5A1A26',
          lineHeight: 1.6,
          fontWeight: 600,
        }}>
          "Mero bihan pani tme mero aandhakar ko sathiii ni tme, na janu la xodi kaile pani ma tmelai sadhai maya garney xu."
        </div>
      </div>

      {/* Cherry blossoms sticker tucked in bottom right */}
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -10, right: -12,
        width: isMobile ? 80 : 75, objectFit: 'contain',
        opacity: 0.75, transform: 'rotate(14deg)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ── Page 3: That Precious Smile (Selfie Collage) ────────────────
function PhotoSmilePage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FFF9F6 0%, #FAEDE7 50%, #F4DEC6 100%)',
      padding: isMobile ? '24px 18px 80px' : '18px 16px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Header */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 2 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#9E6454',
          marginBottom: 3,
        }}>
          ♥ Her Smile ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#4A0E1C',
        }}>
          That Smile
        </div>
      </div>

      {/* Polaroid Photo Frame */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? '86%' : 165,
        maxWidth: isMobile ? 310 : 240,
        background: '#FFF',
        padding: isMobile ? '8px 8px 30px' : '6px 6px 22px',
        boxShadow: '0 10px 28px rgba(107,39,55,0.18)',
        transform: 'rotate(-2deg)',
        borderRadius: 6,
      }}>
        {/* Washi tape at top */}
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: isMobile ? 54 : 48, height: 16,
          background: 'rgba(232,201,123,0.75)',
          border: '1px dashed rgba(160,120,50,0.5)',
          borderRadius: 2, zIndex: 6,
        }}/>
        <img
          src={filmCollage}
          alt="Her smile"
          style={{
            width: '100%',
            height: isMobile ? 260 : 170,
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
            borderRadius: 3,
            background: '#F8F0E8',
          }}
        />
        <div style={{
          position: 'absolute', bottom: isMobile ? 7 : 4, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'Dancing Script, cursive',
          fontSize: isMobile ? 14 : 11,
          color: '#6B2737',
        }}>
          so cute ♥
        </div>
      </div>

      {/* Story Description Card */}
      <div style={{
        zIndex: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(201,168,76,0.4)',
        borderRadius: 10,
        padding: isMobile ? '12px 16px' : '8px 12px',
        maxWidth: isMobile ? 315 : 230,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10, lineHeight: 1.55, color: '#3A151D',
        }}>
          "Yo photo ma kasto cute dekhyeko. Tmi hasda dherai ramri dekhinxa, sadhai yestari nai hasi rakha la."
        </div>
      </div>

      {/* Corner Blossom */}
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, right: -14,
        width: isMobile ? 85 : 75, objectFit: 'contain',
        opacity: 0.75, transform: 'rotate(12deg)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ── Page 4: Grace & Sacred Flags ─────────────────────────
function PhotoPrayerPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FBF6ED 0%, #F5EBDB 50%, #EBE0CB 100%)',
      padding: isMobile ? '24px 18px 80px' : '18px 16px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Header */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 2 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#8F663F',
          marginBottom: 3,
        }}>
          ♥ Prayer Flags ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#421620',
        }}>
          Peaceful
        </div>
      </div>

      {/* Portrait Photo Frame */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? '86%' : 165,
        maxWidth: isMobile ? 310 : 240,
        background: '#FFF',
        padding: isMobile ? '8px 8px 30px' : '6px 6px 22px',
        boxShadow: '0 10px 28px rgba(0,0,0,0.15)',
        transform: 'rotate(2deg)',
        borderRadius: 6,
      }}>
        {/* Bow accent */}
        <img src={ginghamBow} alt="" style={{
          position: 'absolute', top: isMobile ? -16 : -14, right: isMobile ? -14 : -12,
          width: isMobile ? 50 : 44,
          objectFit: 'contain', zIndex: 7,
        }}/>
        <img
          src={prayerPhoto}
          alt="Under prayer flags"
          style={{
            width: '100%',
            height: isMobile ? 260 : 170,
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
            borderRadius: 3,
            background: '#F5EDE0',
          }}
        />
        <div style={{
          position: 'absolute', bottom: isMobile ? 7 : 4, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'Dancing Script, cursive',
          fontSize: isMobile ? 14 : 11,
          color: '#6B2737',
        }}>
          prayer flags ♥
        </div>
      </div>

      {/* Story Description Card */}
      <div style={{
        zIndex: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(201,168,76,0.4)',
        borderRadius: 10,
        padding: isMobile ? '12px 16px' : '8px 12px',
        maxWidth: isMobile ? 315 : 230,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10, lineHeight: 1.55, color: '#3A151D',
        }}>
          "Prayer flags agadi kasto shanta dekheko. May all your prayers and wishes always come true."
        </div>
      </div>

      {/* Corner Branch */}
      <img src={plumBranch} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, left: -14,
        width: isMobile ? 85 : 75, objectFit: 'contain',
        opacity: 0.65, transform: 'rotate(-10deg)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ── Page 5: Serenity in the Garden ───────────────────────
function PhotoGardenPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FDF9F2 0%, #F5ECE0 50%, #E9DFC9 100%)',
      padding: isMobile ? '24px 18px 80px' : '18px 16px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Header */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 2 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#7A6B48',
          marginBottom: 3,
        }}>
          ♥ Quiet Days ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#3A2012',
        }}>
          Just Us
        </div>
      </div>

      {/* Portrait Photo Frame */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? '86%' : 165,
        maxWidth: isMobile ? 310 : 240,
        background: '#FFF',
        padding: isMobile ? '8px 8px 30px' : '6px 6px 22px',
        boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
        transform: 'rotate(-2deg)',
        borderRadius: 6,
      }}>
        {/* Tape detail */}
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: isMobile ? 54 : 48, height: 16,
          background: 'rgba(244,167,185,0.7)',
          border: '1px dashed rgba(160,80,100,0.4)',
          borderRadius: 2, zIndex: 6,
        }}/>
        <img
          src={gardenPhoto}
          alt="In the garden"
          style={{
            width: '100%',
            height: isMobile ? 260 : 170,
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
            borderRadius: 3,
            background: '#EEE6D6',
          }}
        />
        <div style={{
          position: 'absolute', bottom: isMobile ? 7 : 4, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'Dancing Script, cursive',
          fontSize: isMobile ? 14 : 11,
          color: '#6B2737',
        }}>
          peaceful moments ♥
        </div>
      </div>

      {/* Story Description Card */}
      <div style={{
        zIndex: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(201,168,76,0.4)',
        borderRadius: 10,
        padding: isMobile ? '12px 16px' : '8px 12px',
        maxWidth: isMobile ? 315 : 230,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10, lineHeight: 1.55, color: '#3A151D',
        }}>
          "Tme sanga bolna thalepaxi din nai ramro bitxa. Really happy that you're in my life."
        </div>
      </div>

      {/* Corner Flowers */}
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, right: -14,
        width: isMobile ? 85 : 75, objectFit: 'contain',
        opacity: 0.75, transform: 'rotate(8deg)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ── Page 6: Under The Open Sky ───────────────────────────
function PhotoSkyPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FFF8F0 0%, #F8EEDA 50%, #F1DFC4 100%)',
      padding: isMobile ? '24px 18px 80px' : '18px 16px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Header */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 2 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#9E7448',
          marginBottom: 3,
        }}>
          ♥ Open Sky ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#4A0E1C',
        }}>
          Side By Side
        </div>
      </div>

      {/* Portrait Photo Frame - Clean Polaroid without mini frame */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? '86%' : 165,
        maxWidth: isMobile ? 310 : 240,
        background: '#FFF',
        padding: isMobile ? '8px 8px 30px' : '6px 6px 22px',
        boxShadow: '0 10px 28px rgba(107,39,55,0.16)',
        transform: 'rotate(2deg)',
        borderRadius: 6,
      }}>
        <img
          src={couplePhoto}
          alt="Under the sky"
          style={{
            width: '100%',
            height: isMobile ? 255 : 170,
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
            borderRadius: 3,
            background: '#F0EBD8',
          }}
        />
        <div style={{
          position: 'absolute', bottom: isMobile ? 7 : 4, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'Dancing Script, cursive',
          fontSize: isMobile ? 14 : 11,
          color: '#6B2737',
        }}>
          with you always together ♥
        </div>
      </div>

      {/* Story Description Card */}
      <div style={{
        zIndex: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(201,168,76,0.4)',
        borderRadius: 10,
        padding: isMobile ? '12px 16px' : '8px 12px',
        maxWidth: isMobile ? 315 : 230,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10, lineHeight: 1.55, color: '#3A151D',
        }}>
          "Tme jaha vayeni, you're always on my mind. Sangaai hune din chittai aawos."
        </div>
      </div>

      {/* Corner Branch */}
      <img src={plumBranch} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, left: -14,
        width: isMobile ? 85 : 75, objectFit: 'contain',
        opacity: 0.65, transform: 'rotate(15deg) scaleX(-1)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

// ── Page 7: Our Journey Together ─────────────────────────
function OurJourneyPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: isMobile ? 'space-around' : 'center',
      background: 'linear-gradient(160deg, #FCF5F0 0%, #F7EBE2 50%, #EDDCCD 100%)',
      padding: isMobile ? '24px 18px 80px' : '18px 16px 14px',
      boxSizing: 'border-box',
    }}>
      {/* Gold frame inset */}
      <div style={{
        position: 'absolute', inset: isMobile ? 10 : 10,
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 14, pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Header */}
      <div style={{ zIndex: 4, textAlign: 'center', marginTop: isMobile ? 2 : 2 }}>
        <div style={{
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 8.5 : 7.5,
          letterSpacing: 2, textTransform: 'uppercase', color: '#9E6B58',
          marginBottom: 3,
        }}>
          ♥ Just The Beginning ♥
        </div>
        <div style={{
          fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 26 : 20,
          fontWeight: 700, color: '#4A0E1C',
        }}>
          Hamro Katha
        </div>
      </div>

      {/* Dual Scrapbook Photos */}
      <div style={{
        position: 'relative', zIndex: 5,
        width: isMobile ? '92%' : 220,
        maxWidth: isMobile ? 330 : 220,
        height: isMobile ? 230 : 160,
      }}>
        {/* First photo (tilted left) */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: isMobile ? '56%' : 115,
          background: '#FFF',
          padding: isMobile ? '6px 6px 22px' : '5px 5px 16px',
          boxShadow: '0 8px 22px rgba(0,0,0,0.14)',
          transform: 'rotate(-4deg)',
          borderRadius: 4, zIndex: 2,
        }}>
          <img
            src={prayerPhoto}
            alt="Journey memory"
            style={{ width: '100%', height: isMobile ? 145 : 95, objectFit: 'contain', objectPosition: 'center center', display: 'block', borderRadius: 2, background: '#F5EDE0' }}
          />
          <div style={{ textAlign: 'center', fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 12 : 9.5, color: '#6B2737', marginTop: 3 }}>
            tme ra ma ♥
          </div>
        </div>

        {/* Second photo (tilted right) */}
        <div style={{
          position: 'absolute', top: isMobile ? 18 : 14, right: 0,
          width: isMobile ? '56%' : 115,
          background: '#FFF',
          padding: isMobile ? '6px 6px 22px' : '5px 5px 16px',
          boxShadow: '0 8px 22px rgba(0,0,0,0.16)',
          transform: 'rotate(5deg)',
          borderRadius: 4, zIndex: 3,
        }}>
          <img
            src={gardenPhoto}
            alt="Journey memory"
            style={{ width: '100%', height: isMobile ? 145 : 95, objectFit: 'contain', objectPosition: 'center center', display: 'block', borderRadius: 2, background: '#EEE6D6' }}
          />
          <div style={{ textAlign: 'center', fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 12 : 9.5, color: '#6B2737', marginTop: 3 }}>
            always ♥
          </div>
        </div>

        {/* Gingham bow pinned in center */}
        <img src={ginghamBow} alt="" style={{
          position: 'absolute', top: '36%', left: '44%',
          width: isMobile ? 52 : 44, objectFit: 'contain', zIndex: 8,
          transform: 'rotate(-8deg)',
        }}/>
      </div>

      {/* Story Description Card */}
      <div style={{
        zIndex: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        border: '1.5px solid rgba(201,168,76,0.45)',
        borderRadius: 10,
        padding: isMobile ? '12px 16px' : '8px 12px',
        maxWidth: isMobile ? 320 : 230,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
          fontSize: isMobile ? 12.5 : 10, lineHeight: 1.55, color: '#3A151D',
        }}>
          "Tmelai vetera sabai kura ramro vako xa. Hamro maya sadhai yestai rahos ♥"
        </div>
      </div>

      {/* Corner Blossom */}
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', bottom: isMobile ? 35 : -8, left: -14,
        width: isMobile ? 85 : 75, objectFit: 'contain',
        opacity: 0.75, transform: 'rotate(-12deg)', zIndex: 6, pointerEvents: 'none',
      }}/>
    </div>
  )
}

function LetterPage({
  onViewNote,
  isMobile,
  isPlaying,
  onToggleMusic,
  currentTime,
  duration,
}: {
  onViewNote: () => void
  isMobile?: boolean
  isPlaying?: boolean
  onToggleMusic?: () => void
  currentTime?: number
  duration?: number
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #FDF5E6 0%, #F5E4CE 100%)',
      position: 'relative',
      overflowY: isMobile ? 'auto' : 'hidden',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: isMobile ? '24px 18px 80px' : '18px 14px',
      gap: isMobile ? 12 : 10,
      boxSizing: 'border-box',
    }}>
      <img src={plumBranch} alt="" style={{
        position: 'absolute', bottom: -18, left: -18, width: isMobile ? 150 : 120,
        objectFit: 'contain', opacity: 0.35, zIndex: 1,
      }}/>

      <div style={{ zIndex: 5 }}>
        <AudioPill
          compact={!isMobile}
          isPlaying={isPlaying}
          onToggle={onToggleMusic}
          currentTime={currentTime}
          duration={duration}
        />
      </div>

      {/* Paper card */}
      <div style={{
        width: '100%', flex: 1,
        background: 'linear-gradient(180deg, #FFFDFA 0%, #FFF8F0 100%)',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative', zIndex: 5,
        padding: isMobile ? '28px 20px 18px' : '22px 16px 14px',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', zIndex: 8 }}>
          <PaperclipSVG/>
        </div>
        <div style={{ position: 'absolute', top: 6, right: 8, transform: 'rotate(-14deg)', zIndex: 7 }}>
          <DenimStarSVG/>
        </div>

        {/* FROM / FOR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, marginTop: 6, paddingBottom: 8, borderBottom: '1px dashed #D4A080' }}>
          <div>
            <div style={{ fontFamily: 'Lato, sans-serif', fontSize: 8, letterSpacing: 2, color: '#8B5E3C', textTransform: 'uppercase' }}>FROM</div>
            <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 16 : 13, color: '#3D0C52', marginTop: 1 }}>Me</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Lato, sans-serif', fontSize: 8, letterSpacing: 2, color: '#8B5E3C', textTransform: 'uppercase' }}>FOR</div>
            <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 16 : 13, color: '#3D0C52', marginTop: 1 }}>You Always</div>
          </div>
        </div>

        {/* Letter body */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: isMobile ? 13.5 : 11.5, lineHeight: 1.85, color: '#3D2010' }}>
            It's only been a few days since we started loving each other, but having you in my life changed everything.
            Thank you for making me smile every day and understanding me like nobody else does.
            I'm really lucky to have you, and I want to stay by your side always.
          </p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 44, background: 'linear-gradient(transparent, #FFF8F0)' }}/>
        </div>

        <button onClick={onViewNote} style={{
          width: '100%', padding: isMobile ? '14px 0' : '10px 0', borderRadius: 999,
          background: '#6B2737', border: 'none', color: 'white',
          fontFamily: 'Lato, sans-serif', fontSize: isMobile ? 14 : 12, fontWeight: 600, letterSpacing: 0.8,
          cursor: 'pointer', marginTop: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          Tap here to view more <span style={{ fontSize: 16 }}>↓</span>
        </button>
      </div>
    </div>
  )
}

function BackCoverPage({ isMobile }: { isMobile?: boolean }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(158deg, #4A0E1C 0%, #6B2737 45%, #3A000A 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={cherryBlossoms} alt="" style={{
        position: 'absolute', bottom: -10, right: -20, width: isMobile ? '50%' : 160,
        objectFit: 'contain', opacity: 0.65, transform: 'rotate(12deg) scaleX(-1)',
      }}/>
      <img src={polaroidTulips} alt="" style={{
        position: 'absolute', top: 20, left: -8, width: isMobile ? 100 : 80,
        objectFit: 'contain', opacity: 0.55, transform: 'rotate(-7deg)',
      }}/>
      <div style={{ textAlign: 'center', color: '#F5DEB3', zIndex: 5 }}>
        <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: isMobile ? 38 : 26 }}>Hamro Maya</div>
        <div style={{ fontSize: isMobile ? 30 : 22, margin: '10px 0' }}>♥</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: isMobile ? 14 : 11, opacity: 0.75 }}>sadhai vari tmelai maya</div>
        {isMobile && (
          <div style={{ marginTop: 24, fontFamily: 'Lato, sans-serif', fontSize: 11, opacity: 0.5, letterSpacing: 1 }}>
            — with love, just for you ♥
          </div>
        )}
      </div>
    </div>
  )
}

// ── Note Popup ────────────────────────────────────────────

function NotePopup({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end',
      padding: 0,
      animation: 'fadeInOverlay 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #FFFDF5 0%, #FFF4E8 100%)', 
        borderRadius: '28px 28px 0 0',
        padding: 'calc(28px + env(safe-area-inset-top, 0px)) 28px calc(32px + env(safe-area-inset-bottom, 0px))',
        width: '100%',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 -24px 64px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: '#D4A080', borderRadius: 2, margin: '0 auto 24px' }}/>

        <div style={{ fontFamily: 'Dancing Script, cursive', fontSize: 26, color: '#6B2737', textAlign: 'center', marginBottom: 8 }}>
          Just a little note for you ♥
        </div>
        <div style={{ width: 60, height: 1.5, background: '#C9A84C', margin: '0 auto 24px', borderRadius: 1 }}/>

        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 15, lineHeight: 1.9, color: '#2D1A10' }}>
          <p style={{ marginBottom: 16 }}>
            I wanted to keep this real and from my heart. It's only been a few days since we started loving each other, so I don't want to write fake long essays or talk about old memories.
          </p>
          <p style={{ marginBottom: 16 }}>
            Maya bashnu raixa ka ho ka bata khojna puge, samjheko ta pailai thiye tara aaile paye tmelai. Yeti dherai samaye paxi veteko xu, I really don't wanna loose you.
          </p>
          <p style={{ marginBottom: 16 }}>
            Mero bihan pani tme, mero aandhakar ko sathiii ni tme. Na janu la xodi kaile pani, ma tmelai sadhai maya garney xu.
          </p>
          <p>
            Thank you for being in my life. This is just the beginning for us, okay? ♥
          </p>
        </div>

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: 18, color: '#6B2737' }}>— Hamro Maya, sadhai vari ♥</span>
        </div>

        {/* Hearts row */}
        <div style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, marginTop: 16, color: '#D4A0A8' }}>
          ♥ ♥ ♥
        </div>

        <button onClick={onClose} style={{
          width: '100%', marginTop: 24,
          padding: '16px 0', borderRadius: 999,
          background: 'linear-gradient(135deg, #6B2737 0%, #9B4A5C 100%)',
          border: 'none', color: 'white',
          fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 1,
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(107,39,55,0.4)',
        }}>Close ♥</button>
      </div>
    </div>
  )
}

// ── Page renderer ─────────────────────────────────────────

function renderPage(
  idx: number,
  handlers: {
    onNext: () => void
    onPrev: () => void
    onViewNote: () => void
    onToggleMusic: () => void
  },
  musicState: {
    isPlaying: boolean
    currentTime: number
    duration: number
  },
  isMobile: boolean,
) {
  switch (idx) {
    case 0: return <CoverPage isMobile={isMobile} onStart={handlers.onToggleMusic} isPlaying={musicState.isPlaying}/>
    case 1: return <IntroCandlePage onNext={handlers.onNext} onPrev={handlers.onPrev} isMobile={isMobile}/>
    case 2: return <SpreadBLeftPage isMobile={isMobile}/>
    case 3: return <PhotoSmilePage isMobile={isMobile}/>
    case 4: return <PhotoPrayerPage isMobile={isMobile}/>
    case 5: return <PhotoGardenPage isMobile={isMobile}/>
    case 6: return <PhotoSkyPage isMobile={isMobile}/>
    case 7: return <OurJourneyPage isMobile={isMobile}/>
    case 8: return (
      <LetterPage
        onViewNote={handlers.onViewNote}
        isMobile={isMobile}
        isPlaying={musicState.isPlaying}
        onToggleMusic={handlers.onToggleMusic}
        currentTime={musicState.currentTime}
        duration={musicState.duration}
      />
    )
    case 9: return <BackCoverPage isMobile={isMobile}/>
    default: return <div style={{ width: '100%', height: '100%', background: '#1C0A12' }}/>
  }
}

// ── Mobile Nav Bar ────────────────────────────────────────

function MobileNavBar({
  onPrev, onNext, atStart, atEnd, animating, currentPage, totalPages
}: {
  onPrev: () => void; onNext: () => void
  atStart: boolean; atEnd: boolean; animating: boolean
  currentPage: number; totalPages: number
}) {
  const pageLabels = [
    'Cover',
    'Hamro Maya',
    'You & Me',
    'That Smile',
    'Prayer Flags',
    'Quiet Day',
    'For You',
    'New Beginning',
    'My Letter',
    'Hamro Maya',
  ]
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'rgba(38, 10, 18, 0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(201, 168, 76, 0.55)',
      borderRadius: 999,
      padding: '7px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 10px rgba(107,39,55,0.25)',
    }}>
      {/* Prev button */}
      <button onClick={onPrev} disabled={atStart || animating} style={{
        width: 38, height: 38, borderRadius: '50%',
        background: atStart ? 'transparent' : 'rgba(253,245,230,0.12)',
        border: '1px solid rgba(201,168,76,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: atStart ? 'not-allowed' : 'pointer', opacity: atStart ? 0.3 : 1,
      }}>
        <ChevronSVG dir="left" color="#F5DEB3" size={18}/>
      </button>

      {/* Center status */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minWidth: 105, padding: '0 4px',
      }}>
        <span style={{
          fontFamily: 'Dancing Script, cursive', fontSize: 13.5,
          color: '#F5DEB3', letterSpacing: 0.5, lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}>
          {pageLabels[currentPage]}
        </span>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 3.5, alignItems: 'center', marginTop: 3 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              width: i === currentPage ? 12 : 4,
              background: i === currentPage ? '#C9A84C' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.25s ease',
            }}/>
          ))}
        </div>
      </div>

      {/* Next button */}
      <button onClick={onNext} disabled={atEnd || animating} style={{
        width: 38, height: 38, borderRadius: '50%',
        background: atEnd ? 'transparent' : 'rgba(253,245,230,0.12)',
        border: '1px solid rgba(201,168,76,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: atEnd ? 'not-allowed' : 'pointer', opacity: atEnd ? 0.3 : 1,
      }}>
        <ChevronSVG dir="right" color="#F5DEB3" size={18}/>
      </button>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────

export default function App() {
  const layout = useResponsive()
  const { isMobile, pageW, pageH } = layout

  const [spreadIdx, setSpreadIdx] = useState(0)
  const [mobilePageIdx, setMobilePageIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [animDir, setAnimDir] = useState<'fwd' | 'back'>('fwd')
  const [slideOffset, setSlideOffset] = useState(0) // mobile slide animation
  const [noteOpen, setNoteOpen] = useState(false)

  // Audio State & Playback
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.warn('Playback error:', err)
      })
    }
  }, [isPlaying])

  const ensurePlayOnInteraction = useCallback(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {})
    }
  }, [isPlaying])

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const goNext = useCallback(() => {
    if (animating) return
    ensurePlayOnInteraction()
    if (isMobile) {
      if (mobilePageIdx >= TOTAL_PAGES - 1) return
      setAnimating(true)
      setAnimDir('fwd')
      setSlideOffset(-100)
      setTimeout(() => {
        setMobilePageIdx(p => p + 1)
        setSlideOffset(0)
        setAnimating(false)
      }, FLIP_MS)
    } else {
      if (spreadIdx >= SPREADS.length - 1) return
      setAnimating(true)
      setAnimDir('fwd')
      setTimeout(() => {
        setSpreadIdx(s => s + 1)
        setAnimating(false)
      }, FLIP_MS)
    }
  }, [animating, isMobile, mobilePageIdx, spreadIdx])

  const goPrev = useCallback(() => {
    if (animating) return
    ensurePlayOnInteraction()
    if (isMobile) {
      if (mobilePageIdx <= 0) return
      setAnimating(true)
      setAnimDir('back')
      setSlideOffset(100)
      setTimeout(() => {
        setMobilePageIdx(p => p - 1)
        setSlideOffset(0)
        setAnimating(false)
      }, FLIP_MS)
    } else {
      if (spreadIdx <= 0) return
      setAnimating(true)
      setAnimDir('back')
      setTimeout(() => {
        setSpreadIdx(s => s - 1)
        setAnimating(false)
      }, FLIP_MS)
    }
  }, [animating, isMobile, mobilePageIdx, spreadIdx])

  const handlers = { onNext: goNext, onPrev: goPrev, onViewNote: () => setNoteOpen(true), onToggleMusic: togglePlay }
  const musicState = { isPlaying, currentTime, duration }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 1.5) return
    dx < 0 ? goNext() : goPrev()
  }

  // Desktop book values
  const currentSpread = SPREADS[spreadIdx]
  const prevSpread = spreadIdx > 0 ? SPREADS[spreadIdx - 1] : null
  const nextSpread = spreadIdx < SPREADS.length - 1 ? SPREADS[spreadIdx + 1] : null
  const [leftIdx, rightIdx] = currentSpread
  const flipperFront = animDir === 'fwd' ? rightIdx : leftIdx
  const flipperBack = animDir === 'fwd' ? (nextSpread?.[0] ?? -1) : (prevSpread?.[1] ?? -1)

  const bookW = pageW * 2 + 12
  const atStart = isMobile ? mobilePageIdx === 0 : spreadIdx === 0
  const atEnd   = isMobile ? mobilePageIdx === TOTAL_PAGES - 1 : spreadIdx === SPREADS.length - 1

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #110608 0%, #1E0A10 50%, #0D0406 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Lato, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <FloatingHearts/>

      {/* Audio Element for Timilai by Purna Rai */}
      <audio
        ref={audioRef}
        src={timilaiMusic}
        loop
        preload="auto"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Floating Music Pill */}
      <FloatingMusicButton
        isPlaying={isPlaying}
        onToggle={togglePlay}
        isMobile={isMobile}
      />

      {/* ── MOBILE LAYOUT ── */}
      {isMobile ? (
        <div style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
          {/* Current page */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: animating ? `translateX(${slideOffset}%)` : 'translateX(0)',
            transition: animating ? `transform ${FLIP_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
          }}>
            {renderPage(mobilePageIdx, handlers, musicState, true)}
          </div>

          {/* Slide-in next/prev page (visual ghost) */}
          {animating && (
            <div style={{
              position: 'absolute', inset: 0,
              transform: `translateX(${animDir === 'fwd' ? 100 - (100 - Math.abs(slideOffset)) : -(100 - Math.abs(slideOffset))}%)`,
              pointerEvents: 'none',
              opacity: 0.85,
            }}>
              {renderPage(animDir === 'fwd' ? mobilePageIdx + 1 : mobilePageIdx - 1, handlers, musicState, true)}
            </div>
          )}

          {/* Mobile nav */}
          <MobileNavBar
            onPrev={goPrev}
            onNext={goNext}
            atStart={atStart}
            atEnd={atEnd}
            animating={animating}
            currentPage={mobilePageIdx}
            totalPages={TOTAL_PAGES}
          />
        </div>

      ) : (
        /* ── DESKTOP LAYOUT ── */
        <>
          {/* Book */}
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'stretch',
            width: bookW, height: pageH,
            perspective: '2200px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4)',
            borderRadius: 4,
            zIndex: 1,
          }}>
            {/* Left page */}
            <div style={{ width: pageW, height: pageH, position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: 'inset -6px 0 12px rgba(0,0,0,0.12)' }}>
              {renderPage(leftIdx, handlers, musicState, false)}
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  position: 'absolute', top: i * 2, left: -(i * 3), bottom: 0,
                  width: 3, background: `hsl(36,30%,${87 - i * 4}%)`, zIndex: -i,
                }}/>
              ))}
            </div>

            {/* Spine */}
            <div style={{ width: 12, flexShrink: 0, background: 'linear-gradient(to right, #2A0810, #6B2737, #2A0810)', boxShadow: '0 0 16px rgba(0,0,0,0.6)', position: 'relative', zIndex: 10 }}/>

            {/* Right page */}
            <div style={{ width: pageW, height: pageH, position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.08)' }}>
              {renderPage(rightIdx, handlers, musicState, false)}
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  position: 'absolute', top: i * 2, right: -(i * 3), bottom: 0,
                  width: 3, background: `hsl(36,30%,${87 - i * 4}%)`, zIndex: -i,
                }}/>
              ))}
            </div>

            {/* Flip animator */}
            {animating && (
              <div
                className={`page-flipper ${animDir === 'fwd' ? 'flip-fwd' : 'flip-back'}`}
                style={{
                  position: 'absolute',
                  top: 0, width: pageW, height: pageH,
                  ...(animDir === 'fwd'
                    ? { right: 0, transformOrigin: 'left center' }
                    : { left: 0, transformOrigin: 'right center' }
                  ),
                  zIndex: 20,
                }}
              >
                <div className="page-face">
                  {renderPage(flipperFront, handlers, musicState, false)}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: animDir === 'fwd'
                      ? 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 25%, transparent 60%)'
                      : 'linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 25%, transparent 60%)',
                  }}/>
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    ...(animDir === 'fwd' ? { left: 0, width: 28 } : { right: 0, width: 28 }),
                    background: animDir === 'fwd'
                      ? 'linear-gradient(to right, rgba(255,255,255,0.18), transparent)'
                      : 'linear-gradient(to left, rgba(255,255,255,0.18), transparent)',
                    pointerEvents: 'none',
                  }}/>
                </div>
                <div className="page-face-back">
                  {renderPage(flipperBack, handlers, musicState, false)}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: animDir === 'fwd'
                      ? 'linear-gradient(to left, rgba(0,0,0,0.25) 0%, transparent 50%)'
                      : 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 50%)',
                  }}/>
                </div>
              </div>
            )}
          </div>

          {/* Desktop navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, zIndex: 1 }}>
            <button onClick={goPrev} disabled={atStart || animating} style={{
              width: 52, height: 52, borderRadius: '50%',
              background: atStart ? 'rgba(255,255,255,0.06)' : 'rgba(253,245,230,0.12)',
              border: '1.5px solid rgba(201,168,76,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: atStart ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s, background 0.2s',
              opacity: atStart ? 0.4 : 1,
            }}>
              <ChevronSVG dir="left" color="#F5DEB3" size={24}/>
            </button>

            <div style={{ display: 'flex', gap: 6 }}>
              {SPREADS.map((_, i) => (
                <div key={i} style={{
                  height: 6, borderRadius: 3,
                  width: i === spreadIdx ? 20 : 6,
                  background: i === spreadIdx ? '#F5DEB3' : 'rgba(255,255,255,0.25)',
                  transition: 'width 0.3s, background 0.3s',
                }}/>
              ))}
            </div>

            <button onClick={goNext} disabled={atEnd || animating} style={{
              width: 52, height: 52, borderRadius: '50%',
              background: atEnd ? 'rgba(255,255,255,0.06)' : 'rgba(253,245,230,0.12)',
              border: '1.5px solid rgba(201,168,76,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: atEnd ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s, background 0.2s',
              opacity: atEnd ? 0.4 : 1,
            }}>
              <ChevronSVG dir="right" color="#F5DEB3" size={24}/>
            </button>
          </div>
        </>
      )}

      {noteOpen && <NotePopup onClose={() => setNoteOpen(false)}/>}
    </div>
  )
}
