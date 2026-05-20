import { Search, MessageCircle, Users } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      step: '01',
      title: 'Search Your Course',
      desc: 'Type your course name or code to find it across all SIBAU programs.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: MessageCircle,
      step: '02',
      title: 'Join the WhatsApp Group',
      desc: 'Click Join to open the WhatsApp group directly on your phone or browser.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      icon: Users,
      step: '03',
      title: 'Hit the 5-Student Threshold',
      desc: 'Once enough students are in the group, coordinate and register for the summer course together.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
  ]

  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl font-bold text-white text-center mb-10"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map(s => (
            <div
              key={s.step}
              className={`rounded-2xl border ${s.border} ${s.bg} p-6 text-center`}
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mx-auto mb-4`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div className={`text-xs font-bold ${s.color} mb-2 tracking-widest`}>STEP {s.step}</div>
              <h3
                className="text-white font-bold text-lg mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
