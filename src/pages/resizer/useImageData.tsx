import { useCallback, useEffect, useState } from 'react'

/**
 * Hook to load image data from a file or clipboard.
 */
export function useImageData() {
  const [imgData, setImgData] = useState<ImageData>()

  const loadFile = useCallback((file?: File | null) => {
    if (!file) return
    if (file.type.startsWith('image')) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
          canvas.height = img.height
          canvas.width = img.width
          ctx.drawImage(img, 0, 0)
          setImgData(ctx.getImageData(0, 0, img.width, img.height))
        }
      }
    }
    if (file.type.startsWith('video')) {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.onloadeddata = () => {
        video.onseeked = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.height = video.videoHeight
          canvas.width = video.videoWidth
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
          setImgData(
            ctx.getImageData(0, 0, video.videoWidth, video.videoHeight)
          )
        }
        video.currentTime = video.duration / 2
      }
    }
  }, [])

  useEffect(() => {
    document.body.addEventListener('paste', handlePaste)
    document.body.addEventListener('drop', handleDrop)
    document.body.addEventListener('dragover', handleDragOver)
    return () => {
      document.body.removeEventListener('paste', handlePaste)
      document.body.removeEventListener('drop', handleDrop)
      document.body.removeEventListener('dragover', handleDragOver)
    }

    function handleDragOver(this: HTMLElement, e: DragEvent) {
      e.preventDefault()
    }

    function handleDrop(this: HTMLElement, e: DragEvent) {
      e.preventDefault()
      if (!e.dataTransfer) return
      const file = e.dataTransfer.files[0]
      loadFile(file)
    }

    function handlePaste(this: HTMLElement, e: ClipboardEvent) {
      if (!e.clipboardData) return
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image')) {
          loadFile(item.getAsFile())
          return
        }
      }
    }
  }, [loadFile])

  return { imgData, setImgData, loadFile }
}
