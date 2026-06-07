import Link from 'next/link'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { Program } from '@/lib/types'
import { getCategoryLabel } from '@/lib/utils'

const categoryStyles: Record<string, { badge: string; strip: string }> = {
  domestic: { badge: 'bg-blue-100 text-blue-700', strip: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  overseas: { badge: 'bg-indigo-100 text-indigo-700', strip: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
  education: { badge: 'bg-sky-100 text-sky-700', strip: 'bg-gradient-to-br from-sky-400 to-sky-600' },
}

const categoryIcons: Record<string, string> = {
  domestic: '🏥',
  overseas: '🌏',
  education: '📚',
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <section className="bg-gray-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Programs</SectionLabel>
          <h2 className="text-4xl font-black mb-3 text-gray-900">주요 사업</h2>
          <p className="text-text-subtle">국내외에서 다양한 방식으로 생명사랑을 실천합니다</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {programs.slice(0, 4).map(p => {
            const style = categoryStyles[p.category] ?? categoryStyles.domestic
            const icon = categoryIcons[p.category] ?? '🏥'
            return (
              <Link key={p.id} href={`/programs/${p.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">
                  <div className={`h-24 ${style.strip} flex items-center justify-center text-4xl`}>
                    {icon}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} mb-3 inline-block w-fit`}>
                      {getCategoryLabel(p.category)}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">{p.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-auto pt-2">{p.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
          {programs.length === 0 && (
            <p className="col-span-4 text-center text-text-subtle py-10">등록된 사업이 없습니다.</p>
          )}
        </div>
        <div className="text-center mt-10">
          <Link href="/programs" className="inline-flex items-center gap-2 text-primary-darker font-bold text-sm hover:text-primary-dark transition-colors">
            전체 사업 보기 <span className="text-base">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}