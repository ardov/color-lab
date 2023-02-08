import React, { useCallback, useEffect, useState } from 'react'

function useImageData() {
  const [sourceImage, setSourceImage] = useState<ImageData>()

  const loadFile = useCallback((file?: File | null) => {
    if (!file) return
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0)
        setSourceImage(ctx.getImageData(0, 0, img.width, img.height))
      }
    }
  }, [])

  const loadImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      loadFile(e.target.files![0])
    },
    [loadFile]
  )

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

  return {
    data: sourceImage,
    setData: setSourceImage,
    onLoadImage: loadImage,
  }
}
