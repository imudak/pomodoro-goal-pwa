import { useState, useEffect, useRef, useCallback } from 'react'
import type { TimerMode } from '../types'
import { incrementTodayPomodoros, getTodayPomodoros } from '../storage'
import './Timer.css'

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const LABELS: Record<TimerMode, string> = {
  work: '集中',
  shortBreak: '小休憩',
  longBreak: '大休憩',
}

interface Props {
  onPomodoroComplete: () => void
}

export default function Timer({ onPomodoroComplete }: Props) {
  const [mode, setMode] = useState<TimerMode>('work')
  const [seconds, setSeconds] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [todayCount, setTodayCount] = useState(getTodayPomodoros)
  const intervalRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const switchMode = useCallback((m: TimerMode) => {
    stop()
    setMode(m)
    setSeconds(DURATIONS[m])
  }, [stop])

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          stop()
          // Notify
          if (Notification.permission === 'granted') {
            new Notification(mode === 'work' ? '🍅 ポモドーロ完了！' : '☕ 休憩終了！')
          }
          if (mode === 'work') {
            const count = incrementTodayPomodoros()
            setTodayCount(count)
            onPomodoroComplete()
            // Auto switch to break
            const nextMode = count % 4 === 0 ? 'longBreak' : 'shortBreak'
            setMode(nextMode)
            return DURATIONS[nextMode]
          } else {
            setMode('work')
            return DURATIONS.work
          }
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, mode, stop, onPomodoroComplete])

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const progress = 1 - seconds / DURATIONS[mode]

  return (
    <div className="timer">
      <div className="timer-modes">
        {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="timer-circle">
        <svg viewBox="0 0 120 120" className="timer-svg">
          <circle cx="60" cy="60" r="54" className="timer-track" />
          <circle
            cx="60" cy="60" r="54"
            className="timer-progress"
            style={{
              strokeDasharray: `${2 * Math.PI * 54}`,
              strokeDashoffset: `${2 * Math.PI * 54 * (1 - progress)}`,
              stroke: mode === 'work' ? 'var(--red)' : 'var(--green)',
            }}
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="timer-mode-label">{LABELS[mode]}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button
          className={`control-btn ${running ? 'pause' : 'start'}`}
          onClick={() => setRunning(!running)}
        >
          {running ? '一時停止' : 'スタート'}
        </button>
        <button className="control-btn reset" onClick={() => switchMode(mode)}>
          リセット
        </button>
      </div>

      <div className="timer-today">
        今日のポモドーロ: <strong>{todayCount}</strong> 回
        （{todayCount * 25}分）
      </div>
    </div>
  )
}
