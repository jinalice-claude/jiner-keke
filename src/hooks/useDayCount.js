import { useState, useEffect } from 'react'

// ★ 把这里改成你们真正的纪念日 ★
const ANNIVERSARY = new Date('2026-05-30T00:00:00')

export function useDayCount() {
  const [days, setDays] = useState(0)

  useEffect(() => {
    function calc() {
      const diff = Date.now() - ANNIVERSARY.getTime()
      setDays(Math.max(0, Math.floor(diff / 86_400_000)))
    }
    calc()
    // refresh at midnight
    const now = new Date()
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now
    const timer = setTimeout(() => {
      calc()
    }, msToMidnight)
    return () => clearTimeout(timer)
  }, [])

  return { days, anniversary: ANNIVERSARY }
}
