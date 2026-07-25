import type { Metadata } from 'next'
import { getMilestones } from '@/lib/repositories/misc'
import { PageHero } from '@/components/ui/PageHero'
import { HistoryTimeline } from './HistoryTimeline'

export const metadata: Metadata = { title: '발자취' }

export const revalidate = 60

export default async function HistoryPage() {
  const milestones = await getMilestones()

  return (
    <>
      <PageHero label="History" title="발자취" icon="🕰️" maxWidth="max-w-3xl" />

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <HistoryTimeline milestones={milestones} />
        </div>
      </div>
    </>
  )
}
