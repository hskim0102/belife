import Link from 'next/link'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Program } from '@/lib/sanity/types'
import { getCategoryLabel } from '@/lib/utils'

const categoryColors: Record<string, string> = {
  domestic: 'bg-primary-lighter text-primary',
  overseas: 'bg-blue-100 text-blue-600',
  education: 'bg-yellow-100 text-yellow-700',
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <section className="bg-primary-light py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>Programs</SectionLabel>
          <h2 className="text-3xl font-black mb-2">주요 사업</h2>
          <p className="text-text-subtle">국내외에서 다양한 방식으로 생명사랑을 실천합니다</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {programs.slice(0, 4).map(p => (
            <Link key={p._id} href={`/programs/${p.slug.current}`}>
              <div className="bg-white rounded-card-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-28 bg-primary-light flex items-center justify-center text-4xl">🏥</div>
                <div className="p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category]} mb-2 inline-block`}>
                    {getCategoryLabel(p.category)}
                  </span>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <p className="text-xs text-text-subtle mt-1 leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/programs" className="text-primary font-semibold text-sm hover:underline">전체 사업 보기 →</Link>
        </div>
      </div>
    </section>
  )
}
