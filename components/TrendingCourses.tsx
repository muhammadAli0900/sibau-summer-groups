import Link from 'next/link'
import { getProgramColor } from '@/lib/programColors'

export type TrendingCourse = {
  course_id: string
  title: string
  code: string
  program_name: string
  program_color: string
  program_code: string
  interest_count: number
  group_count: number
}

type Props = {
  courses: TrendingCourse[]
}

export default function TrendingCourses({ courses }: Props) {
  if (!courses.length) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
        >
          Most Wanted Courses
        </h2>
        <p
          className="text-sm mb-8"
          style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
        >
          Courses with the most student interest this summer
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map(course => {
            const color = getProgramColor(course.program_code, course.program_color)
            return (
              <Link
                key={course.course_id}
                href={`/course/${course.course_id}`}
                className="flex rounded-xl overflow-hidden transition-all duration-200 hover:bg-[#2a2118] hover:border-[#4a3a28]"
                style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}
              >
                {/* Left color strip */}
                <div style={{ width: 3, backgroundColor: color, flexShrink: 0 }} />
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#2a2118', color, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {course.program_code}
                    </span>
                  </div>
                  <h3
                    className="text-sm font-medium leading-snug mb-4"
                    style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {course.title}
                  </h3>
                  <div>
                    <div
                      className="text-3xl font-bold"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}
                    >
                      {course.interest_count}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      interested &middot;{' '}
                      {course.group_count > 0
                        ? `${course.group_count} ${course.group_count === 1 ? 'group' : 'groups'}`
                        : 'no groups yet'}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
