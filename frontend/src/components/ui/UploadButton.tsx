import { useRef } from 'react'
import { UploadIcon } from './UploadIcon'

interface UploadButtonProps {
  onFilesSelected: (files: FileList) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  uploading?: boolean
  label?: string
  compact?: boolean
}

export function UploadButton({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  disabled = false,
  uploading = false,
  label = 'Upload',
  compact = true,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className={compact ? 'brutal-btn brutal-btn--compact' : 'brutal-btn'}
      >
        <span>{uploading ? 'Uploading…' : label}</span>
        <UploadIcon />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) onFilesSelected(event.target.files)
          event.target.value = ''
        }}
        className="hidden"
      />
    </>
  )
}
