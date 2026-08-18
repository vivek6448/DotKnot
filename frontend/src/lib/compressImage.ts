const MAX_DIMENSION = 1600
const QUALITY = 0.82

/**
 * Downscales and re-encodes an uploaded image client-side before it hits
 * storage, so a phone-camera photo (often 3000px+) doesn't get served
 * full-resolution to every shopper. Falls back to the original file on
 * anything unexpected — an upload should never fail because compression did.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
    if (!blob || blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^./]+$/, '') + '.webp'
    return new File([blob], newName, { type: 'image/webp' })
  } catch {
    return file
  }
}
