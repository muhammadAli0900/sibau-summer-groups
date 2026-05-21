import { Users, BookOpen, Link2 } from 'lucide-react'

type Props = {
  stats: { groups: number; courses: number; joins: number }
}

export default function StatsSection({ stats }: Props) {
  const items = [
    { label: 'Groups Listed', value: stats.groups, icon: Link2, color: 'text-blue-400' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Total Joins', value: stats.joins, icon: Users, color: 'text-emerald-400' },
  ]

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
        {items.map(item => (
          <div
            key={item.label}
            className="bg-gradient-to-b from-slate-800 to-slate-800/80 border border-slate-700/50 rounded-xl p-6 text-center"
          >
            <item.icon className={`w-7 h-7 ${item.color} mx-auto mb-3`} />
            <div
              className="text-5xl font-black text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {item.value}
            </div>
            <div className="text-slate-500 text-xs mt-2 font-medium uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
