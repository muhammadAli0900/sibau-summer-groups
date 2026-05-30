const steps = [
  {
    step: '01',
    title: 'Search Your Course',
    desc: 'Type your course name or code to find it across all SIBAU programs.',
  },
  {
    step: '02',
    title: 'Join the WhatsApp Group',
    desc: 'Click Join to open the WhatsApp group directly on your phone or browser.',
  },
  {
    step: '03',
    title: 'Hit the 5-Student Threshold',
    desc: 'Once enough students are in the group, coordinate and register for the summer course together.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-14"
          style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {steps.map(s => (
            <div key={s.step} style={{ borderTop: '2px solid #c9a96e', paddingTop: '1.5rem' }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#3d3020',
                  fontSize: '4rem',
                  lineHeight: 1,
                  fontWeight: 800,
                }}
              >
                {s.step}
              </div>
              <h3
                className="text-lg font-semibold mt-4 mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
              >
                {s.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
