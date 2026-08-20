import type { Metadata } from 'next'
import { getLocationSettings } from '@/lib/repositories/location'
import { LocationForm } from './LocationForm'

export const metadata: Metadata = { title: '오시는 길' }
export const dynamic = 'force-dynamic'

export default async function AdminLocationPage() {
  const current = await getLocationSettings()

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">오시는 길</h1>
        <p className="text-sm text-gray-400 mt-1">
          &lsquo;아름다운생명사랑은 → 오시는 길&rsquo; 페이지의 주소·지도·교통 안내·약도를 수정합니다.
        </p>
      </div>

      <LocationForm current={current} />
    </div>
  )
}
