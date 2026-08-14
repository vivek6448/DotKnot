import { useSetting } from '../../hooks/useSetting'

export function AnnouncementBar() {
  const { data } = useSetting<{ text?: string }>('announcement')

  if (!data?.text) return null

  return (
    <div className="border-b border-accent/30 bg-surface py-2 text-center text-xs text-gray-200">
      <p>{data.text}</p>
    </div>
  )
}
