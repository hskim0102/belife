import { NextRequest, NextResponse } from 'next/server'
import { getCommentsByPostId, createComment } from '@/lib/repositories/comments'
import { getPostById } from '@/lib/repositories/posts'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const id = parseInt(postId)

    if (isNaN(id)) {
      return NextResponse.json({ error: '유효한 게시물 ID가 아닙니다.' }, { status: 400 })
    }

    const comments = await getCommentsByPostId(id)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const id = parseInt(postId)

    if (isNaN(id)) {
      return NextResponse.json({ error: '유효한 게시물 ID가 아닙니다.' }, { status: 400 })
    }

    const body = await request.json()
    const { author, email, content, password } = body

    if (!author || !email || !content || !password) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // Post 존재 여부 확인
    const post = await getPostById(id)
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 })
    }

    const comment = await createComment(
      id,
      author.trim(),
      email.trim(),
      content.trim(),
      password.trim()
    )
    if (!comment) {
      return NextResponse.json({ error: '댓글을 작성할 수 없습니다.' }, { status: 500 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: '댓글을 작성할 수 없습니다.' }, { status: 500 })
  }
}
