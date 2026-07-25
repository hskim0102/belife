import Link from 'next/link'
import Image from 'next/image'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { Program } from '@/lib/types'
import { getCategoryLabel } from '@/lib/utils'

/** 홈에 노출할 사업 개수. 전체 목록은 /programs 에서 확인한다. */
const FEATURED_COUNT = 3

const categoryStyles: Record<string, { badge: string; strip: string; icon: string }> = {
  domestic: {
    badge: 'bg-emerald-100 text-emerald-700',
    strip: 'bg-gradient-to-br from-emerald-100 to-emerald-300',
    icon: '🏥',
  },
  overseas: {
    badge: 'bg-teal-100 text-teal-700',
    strip: 'bg-gradient-to-br from-teal-100 to-teal-300',
    icon: '🌏',
  },
  education: {
    badge: 'bg-amber-100 text-amber-700',
    strip: 'bg-gradient-to-br from-amber-100 to-amber-300',
    icon: '📚',
  },
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <section className="bg-gradient-to-b from-cream to-cream-deep pt-14 pb-24 px-6">
      <SectionDivider />
      <div className="max-w-6xl mx-auto mt-16">
        <div className="text-center mb-12">
          <SectionLabel>Programs</SectionLabel>
          <h2 className="text-4xl font-black mb-3 text-gray-900">주요 사업</h2>
          <p className="text-text-subtle">국내외에서 다양한 방식으로 생명사랑을 실천합니다</p>
        </div>

        {programs.length === 0 ? (
          <p className="text-center text-text-subtle py-10">등록된 사업이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {programs.slice(0, FEATURED_COUNT).map(p => {
              const style = categoryStyles[p.category] ?? categoryStyles.domestic
              return (
                <Link key={p.id} href={`/programs/${p.slug}`} className="group">
                  <article className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                    <div className={`relative aspect-[4/3] overflow-hidden ${style.strip}`}>
                      {p.thumbnail ? (
                        <Image
                          src={p.thumbnail}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-6xl">
                          {style.icon}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} mb-3 inline-block w-fit`}>
                        {getCategoryLabel(p.category)}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2 group-hover:text-primary-dark transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed line-clamp-3">{p.description}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary-dark group-hover:gap-2 transition-all">
                        자세히 보기 →
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary-dark font-bold text-base px-8 py-3 rounded-full hover:bg-primary-light transition-colors"
          >
            전체 사업 보기 <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
