type Props = {
  stats: { groups: number; courses: number; joins: number }
}

export default function StatsSection({ stats }: Props) {
  const items = [
    { label: 'Groups Listed', value: stats.groups },
    { label: 'Courses', value: stats.courses },
    { label: 'Total Joins', value: stats.joins },
  ]

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center flex-wrap gap-0">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center">
              <div className="text-center px-8 sm:px-12 py-4">
                <div
                  className="text-5xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}
                >
                  {item.value}
                </div>
                <div
                  className="text-sm mt-2"
                  style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.label}
                </div>
              </div>
              {i < items.length - 1 && (
                <div style={{ width: 1, height: 64, backgroundColor: '#3d3020', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
