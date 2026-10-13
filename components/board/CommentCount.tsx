interface CommentCountProps {
  /** 목록 쿼리가 함께 실어 온 댓글 수(post.commentCount). */
  count?: number
  className?: string
}

// 예전에는 카드마다 /api/posts/:id/comments 를 불러 세었다. 목록 쿼리에서 받은 값을 그대로 쓴다.
export function CommentCount({ count, className = '' }: CommentCountProps) {
  if (!count) return null
  return <span className={className}>댓글 {count}</span>
}
