export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    notice: '공지사항',
    activity: '활동소식',
    general: '일반',
    faq: '자주 묻는 질문',
    domestic: '국내',
    overseas: '해외',
    education: '교육',
  }
  return map[category] ?? category
}
