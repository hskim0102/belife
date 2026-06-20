'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: number
  post_id: number
  author: string
  email: string
  content: string
  password: string
  created_at: string
  updated_at: string
}

interface CommentSectionProps {
  postId: number
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletePasswordId, setDeletePasswordId] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: '',
    password: '',
  })

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (!response.ok) throw new Error('댓글을 불러올 수 없습니다.')
      const data = await response.json()
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (
      !formData.author.trim() ||
      !formData.email.trim() ||
      !formData.content.trim() ||
      !formData.password.trim()
    ) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '댓글을 작성할 수 없습니다.')
      }

      const newComment = await response.json()
      setComments(prev => [newComment, ...prev])
      setFormData({ author: '', email: '', content: '', password: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (commentId: number) => {
    setDeletePasswordId(commentId)
    setDeletePassword('')
  }

  const handleConfirmDelete = async () => {
    if (!deletePasswordId) return

    try {
      const response = await fetch(`/api/comments/${deletePasswordId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '댓글을 삭제할 수 없습니다.')
      }

      setComments(prev => prev.filter(c => c.id !== deletePasswordId))
      setDeletePasswordId(null)
      setDeletePassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const handleCancelDelete = () => {
    setDeletePasswordId(null)
    setDeletePassword('')
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-black text-gray-900 mb-8">댓글 ({comments.length})</h2>

      {/* 댓글 작성 폼 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">댓글 작성</h3>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="author"
              placeholder="이름"
              value={formData.author}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            />
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            />
          </div>
          <textarea
            name="content"
            placeholder="댓글을 작성해주세요."
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (댓글 삭제 시 필요)"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white font-bold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '작성 중...' : '댓글 작성'}
          </button>
        </form>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-gray-400 py-8">댓글을 불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">아직 댓글이 없습니다.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                </div>
                {deletePasswordId === comment.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      placeholder="비밀번호"
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      onClick={handleConfirmDelete}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      확인
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteClick(comment.id)}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
