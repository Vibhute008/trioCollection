import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function AdminKeyboardShortcut() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (!location.pathname.startsWith('/admin')) {
          navigate('/admin')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, location])

  return null
}
