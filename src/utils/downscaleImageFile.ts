const DEFAULT_MAX_EDGE = 2560
const JPEG_QUALITY = 0.88

/**
 * If the image exceeds `maxEdge` on the longest side, downscale in the browser before upload.
 * Reduces upload size and server memory use for very large photos.
 */
export async function downscaleImageFileIfNeeded(file: File, maxEdge: number = DEFAULT_MAX_EDGE): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file
  }
  try {
    const bitmap = await createImageBitmap(file)
    try {
      const { width, height } = bitmap
      if (width <= maxEdge && height <= maxEdge) {
        return file
      }
      const scale = Math.min(maxEdge / width, maxEdge / height)
      const w = Math.max(1, Math.round(width * scale))
      const h = Math.max(1, Math.round(height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        return file
      }
      ctx.drawImage(bitmap, 0, 0, w, h)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY)
      })
      if (!blob || blob.size >= file.size) {
        return file
      }
      const base = file.name.replace(/\.[^.]+$/, "") || "image"
      return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() })
    } finally {
      bitmap.close()
    }
  } catch {
    return file
  }
}
