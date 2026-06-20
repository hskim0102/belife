import { NextRequest, NextResponse } from 'next/server'
import { getComment, deleteComment } from '@/lib/repositories/comments'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const id = parseInt(commentId)

    if (isNaN(id)) {
      return NextResponse.json({ error: '유효한 댓글 ID가 아닙니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const comment = await getComment(id)
    if (!comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const deleted = await deleteComment(id, password)
    if (!deleted) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: '댓글을 삭제할 수 없습니다.' }, { status: 500 })
  }
}
