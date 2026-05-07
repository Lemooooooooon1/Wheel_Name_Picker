// src/components/EntryPanel.jsx
import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWheelStore } from '../hooks/useWheelStore'

export function EntryPanel() {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const { entries, addEntry, removeEntry, shuffleEntries, clearEntries, isSpinning } = useWheelStore()

  const handleAdd = useCallback(() => {
    const val = inputValue.trim()
    if (!val) return
    const ok = addEntry(val)
    if (!ok) {
      setError('Name already exists')
      setTimeout(() => setError(''), 2000)
    } else {
      setInputValue('')
      setError('')
    }
  }, [inputValue, addEntry])

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Enter') handleAdd()
      if (e.key === 'Escape') {
        setInputValue('')
        setError('')
      }
    },
    [handleAdd]
  )

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Input row */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-white/40 uppercase tracking-widest">
          Add Participants
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (error) setError('')
              }}
              onKeyDown={handleKey}
              placeholder="Enter a name…"
              maxLength={40}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium placeholder-white/20 text-white/90 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: error
                  ? '1px solid rgba(244,63,94,0.6)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => {
                e.target.style.border = error
                  ? '1px solid rgba(244,63,94,0.6)'
                  : '1px solid rgba(99,102,241,0.5)'
                e.target.style.background = 'rgba(255,255,255,0.07)'
              }}
              onBlur={(e) => {
                e.target.style.border = error
                  ? '1px solid rgba(244,63,94,0.6)'
                  : '1px solid rgba(255,255,255,0.08)'
                e.target.style.background = 'rgba(255,255,255,0.05)'
              }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute -bottom-5 left-0 text-xs text-rose-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: inputValue.trim() ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            Add
          </motion.button>
        </div>
      </div>

      {/* Count + Actions */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-white/30 font-medium">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex gap-2">
          <ActionButton
            onClick={shuffleEntries}
            disabled={entries.length < 2 || isSpinning}
            title="Shuffle"
          >
            <ShuffleIcon />
          </ActionButton>
          <ActionButton
            onClick={clearEntries}
            disabled={entries.length === 0 || isSpinning}
            title="Clear all"
            danger
          >
            <TrashIcon />
          </ActionButton>
        </div>
      </div>

      {/* Entries list */}
      <div
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        style={{ minHeight: 0, maxHeight: '420px' }}
      >
        <AnimatePresence initial={false}>
          {entries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div
                className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
                  <path d="M10 6v4M10 14h.01" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-white/25 font-medium">No entries yet</p>
              <p className="text-xs text-white/15 mt-1">Add names above to get started</p>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <EntryItem
                key={entry.id}
                entry={entry}
                index={index}
                onRemove={() => removeEntry(entry.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EntryItem({ entry, index, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(entry.name)
  const editRef = useRef(null)
  const { updateEntry, isSpinning } = useWheelStore()

  const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  ]
  const color = COLORS[index % COLORS.length]

  const commitEdit = () => {
    const val = editValue.trim()
    if (val && val !== entry.name) {
      updateEntry(entry.id, val)
    } else {
      setEditValue(entry.name)
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl glass-hover no-select"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Color dot */}
      <div
        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
      />

      {/* Name */}
      {isEditing ? (
        <input
          ref={editRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') {
              setEditValue(entry.name)
              setIsEditing(false)
            }
          }}
          autoFocus
          className="flex-1 bg-transparent text-sm text-white/90 outline-none border-b border-brand-500/50 pb-0.5"
          maxLength={40}
        />
      ) : (
        <span
          className="flex-1 text-sm text-white/75 font-medium truncate cursor-text"
          onDoubleClick={() => !isSpinning && setIsEditing(true)}
          title="Double-click to edit"
        >
          {entry.name}
        </span>
      )}

      {/* Remove */}
      {!isEditing && (
        <motion.button
          onClick={onRemove}
          disabled={isSpinning}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 disabled:cursor-not-allowed"
          style={{ background: 'rgba(244,63,94,0.15)' }}
          title="Remove"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  )
}

function ActionButton({ onClick, disabled, title, danger, children }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.08 } : {}}
      whileTap={!disabled ? { scale: 0.93 } : {}}
      className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
      style={{
        background: danger ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${danger ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {children}
    </motion.button>
  )
}

function ShuffleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 3h2l1.5 2L6 3h2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3l1.5 1.5L8 6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 10h2l3.5-4 1.5 2H10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8l1.5 1.5L8 11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
      <path d="M1 3h10M4 3V2h4v1M2 3l.8 8.2c.05.45.43.8.88.8h4.64c.45 0 .83-.35.88-.8L10 3" stroke="rgba(244,63,94,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
