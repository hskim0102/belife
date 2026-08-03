import { getThemeSettings } from '@/lib/repositories/theme'
import { ThemePickerForm } from './ThemePickerForm'

export const metadata = { title: '테마 색상 | 관리자' }
export const dynamic = 'force-dynamic'

export default async function ThemeSettingsPage() {
  const current = await getThemeSettings()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">테마 색상</h1>
        <p className="text-sm text-gray-500">
          홈페이지 전체에 적용되는 대표 색상과 농도를 선택합니다. 저장하면 즉시 사이트에 반영됩니다.
        </p>
      </div>
      <ThemePickerForm current={current.color} currentBrightness={current.brightness} />
    </div>
  )
}
