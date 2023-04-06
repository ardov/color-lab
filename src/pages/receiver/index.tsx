import { useEffect, useState } from 'react'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Stack } from '@/shared/ui/Stack'
import { Button } from '@/shared/ui/Button'

const theme = makeTheme({})

export function Receiver() {
  applyTheme(document.body, theme)
  const [message, setMessage] = useState<any>(localStorage.getItem('msg'))

  useEffect(() => {
    const getMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://www.semrush.com') return
      console.log('Get message', e)
      localStorage.setItem('msg', JSON.stringify(e.data, null, 2))
      setMessage(e.data)
    }
    window.addEventListener('message', getMessage)
    return () => {
      window.removeEventListener('message', getMessage)
    }
  }, [])

  return (
    <Stack axis="y" gap={1} p={3}>
      <div>
        <Button onClick={() => window.postMessage({ hello: { its: 'me' } })}>
          Post msg
        </Button>
      </div>
      <pre>{message ? JSON.stringify(message, null, 2) : 'Nothing'}</pre>
    </Stack>
  )
}