const SIZE_ROWS = [
  { size: 'XS', chest: '34–36', length: '26' },
  { size: 'S', chest: '36–38', length: '27' },
  { size: 'M', chest: '38–40', length: '28' },
  { size: 'L', chest: '40–42', length: '29' },
  { size: 'XL', chest: '42–44', length: '30' },
  { size: 'XXL', chest: '44–46', length: '31' },
]

export function SizeGuide() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-4 text-2xl font-semibold text-white">Size Guide</h1>
      <p className="mb-6 text-sm text-gray-400">
        Measurements are in inches. For a relaxed fit, we recommend sizing up. If you're between sizes,
        the smaller size gives a more fitted look.
      </p>
      <table className="w-full border-collapse text-left text-sm text-gray-400">
        <thead>
          <tr className="border-b border-white/10 text-white">
            <th className="py-2 pr-4 font-medium">Size</th>
            <th className="py-2 pr-4 font-medium">Chest</th>
            <th className="py-2 font-medium">Length</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_ROWS.map((row) => (
            <tr key={row.size} className="border-b border-white/5">
              <td className="py-2 pr-4 font-medium text-gray-200">{row.size}</td>
              <td className="py-2 pr-4">{row.chest}</td>
              <td className="py-2">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-sm text-gray-400">
        Still unsure? Reach out on{' '}
        <a href="/contact" className="text-accent-soft underline">
          Contact
        </a>{' '}
        and we'll help you pick a size.
      </p>
    </div>
  )
}
