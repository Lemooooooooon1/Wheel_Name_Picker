// src/components/Header.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useWheelStore } from '../hooks/useWheelStore'




export function Header() {
  const { soundEnabled, toggleSound } = useWheelStore()

  return (  

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="2" fill="white" />
            <line x1="8" y1="1" x2="8" y2="4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="8" y1="12" x2="8" y2="15" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="1" y1="8" x2="4" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="12" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white/90 leading-none">Wheel Picker</h1>
          <p className="text-xs text-white/30 mt-0.5">Spin & Decide</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={toggleSound}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{
            background: soundEnabled ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${soundEnabled ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </motion.button>
      </div>
    </motion.header>
    </div>
  )
}

function SoundOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 5H4.5L7.5 2.5V11.5L4.5 9H2V5Z" fill="rgba(99,102,241,0.8)" />
      <path d="M9.5 4.5C10.3 5.3 10.3 8.7 9.5 9.5" stroke="rgba(99,102,241,0.8)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 3C12.5 4.5 12.5 9.5 11 11" stroke="rgba(99,102,241,0.5)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 5H4.5L7.5 2.5V11.5L4.5 9H2V5Z" fill="rgba(255,255,255,0.3)" />
      <path d="M10 5L12 9M12 5L10 9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
