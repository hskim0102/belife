import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { uploadPostImage, UploadError } from '@/lib/blob'

// 게시판 본문(tiptap) 이미지 업로드 엔드포인트. 관리자 인증 필요.
export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  let file: FormDataEntryValue | null
  try {
    const form = await req.formData()
    file = form.get('file')
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '이미지 파일이 없습니다.' }, { status: 400 })
  }

  try {
    const { url } = await uploadPostImage(file)
    return NextResponse.json({ url })
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 })
    return NextResponse.json({ error: '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
