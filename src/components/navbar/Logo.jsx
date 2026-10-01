import React from 'react'
import { Link } from 'react-router-dom'

export function Logo({ variant = 'dark', className = '', size = 'md' }) {
  const isWhite = variant === 'white'

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Icon Pin/Island */}
      <div className="w-8 h-8 rounded-full bg-[#0F766E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          {/* Compass / Island / Mountain SVG path */}
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight text-lg leading-tight ${
            isWhite ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          Tripin
        </span>
      </div>
    </Link>
  )
}
