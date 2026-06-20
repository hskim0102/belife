'use client'

import { useEffect, useState } from 'react'

interface CommentCountProps {
  postId: number
  className?: string
}

export function CommentCount({ postId, className = '' }: CommentCountProps) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        if (response.ok) {
          const comments = await response.json()
          setCount(comments.length)
        }
      } catch (err) {
        console.error(`Failed to load comment count for post ${postId}:`, err)
      }
    }

    fetchCount()
  }, [postId])

  if (count === null || count === 0) return null

  return <span className={className}>댓글 {count}</span>
}
