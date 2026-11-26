import 'server-only'
import { unstable_cache } from 'next/cache'
import { getPublishedMenuPages } from '@/lib/repositories/menuPages'
import { getAllPrograms } from '@/lib/repositories/programs'
import { getActivityTagCounts, getBoardTagCounts, getPostBySlug, getPostsPage, type PostsPageParams } from '@/lib/repositories/posts'
import { getCommentsByPostId } from '@/lib/repositories/comments'
import { getActiveNotification } from '@/lib/repositories/notifications'
import { getThemeSettings } from '@/lib/repositories/theme'

// 공개 화면용 DB 조회 캐시.
//
// 레이아웃(헤더 메뉴·팝업·테마)은 모든 페이지 렌더마다 실행되고, 검색·페이지 파라미터가 있는
// 목록(/news, /board/*, /programs)은 요청마다 렌더된다. 그대로 두면 방문·크롤링마다 쿼리가
// 쌓여 무료 DB 한도를 금방 넘긴다(Prisma Postgres 가 그렇게 막혔다).
// 결과를 태그 단위로 캐시하고, 관리자 화면에서 고칠 때 revalidateTag 로 해당 태그만 비운다.
// 관리자 화면 자체는 여기 함수를 쓰지 않고 저장소 함수를 직접 불러 항상 최신 값을 본다.

export const CACHE_TAGS = {
  /** 메뉴 페이지(헤더 하위 메뉴) */
  menu: 'menu-pages',
  /** 사업(헤더 하위 메뉴, 홈, 사업 목록) */
  programs: 'programs',
  /** 게시글 목록·활동소식 분류 */
  posts: 'posts',
  notification: 'notification',
  theme: 'theme',
} as const

/** 글 한 건의 태그. 수정·삭제 시 그 글만 비운다(전체 posts 태그를 비우면 5,600개가 다시 조회된다). */
export const postTag = (slug: string) => `post:${slug}`
/** 글 한 건의 댓글 목록 태그 */
export const commentsTag = (postId: number) => `comments:${postId}`

/** 관리자가 고치면 태그로 즉시 비우므로 시간 기반 만료는 안전망 정도로 길게 둔다. */
const HOUR = 3600

export const getCachedMenuPages = unstable_cache(getPublishedMenuPages, ['menu-pages'], {
  tags: [CACHE_TAGS.menu],
  revalidate: HOUR,
})

export const getCachedPrograms = unstable_cache(getAllPrograms, ['programs'], {
  tags: [CACHE_TAGS.programs],
  revalidate: HOUR,
})

export const getCachedActivityTagCounts = unstable_cache(getActivityTagCounts, ['activity-tag-counts'], {
  tags: [CACHE_TAGS.posts],
  revalidate: HOUR,
})

export const getCachedActiveNotification = unstable_cache(getActiveNotification, ['active-notification'], {
  tags: [CACHE_TAGS.notification],
  revalidate: HOUR,
})

export const getCachedThemeSettings = unstable_cache(getThemeSettings, ['theme-settings'], {
  tags: [CACHE_TAGS.theme],
  revalidate: HOUR,
})

export const getCachedBoardTagCounts = unstable_cache(getBoardTagCounts, ['board-tag-counts'], {
  tags: [CACHE_TAGS.posts],
  revalidate: HOUR,
})

/** 목록 페이지. 인자(카테고리·태그·페이지·검색어)가 캐시 키에 포함된다. */
export const getCachedPostsPage = unstable_cache(
  (params: PostsPageParams) => getPostsPage(params),
  ['posts-page'],
  { tags: [CACHE_TAGS.posts], revalidate: 600 },
)

const DAY = 86400

/**
 * 게시글 상세. Neon 무료 컴퓨트(월 100 CU-시간)를 다 쓴 원인이 상세 페이지 5,600개를 도는
 * 크롤러였다. 데이터 캐시는 재배포 후에도 남으므로 한 번 읽은 글은 다시 DB 를 깨우지 않는다.
 */
export function getCachedPostBySlug(slug: string) {
  return unstable_cache(() => getPostBySlug(slug), ['post-by-slug', slug], {
    tags: [postTag(slug)],
    revalidate: DAY,
  })()
}

/** 댓글 목록. 작성·삭제 API 가 commentsTag 로 비운다. */
export function getCachedComments(postId: number) {
  return unstable_cache(() => getCommentsByPostId(postId), ['comments', String(postId)], {
    tags: [commentsTag(postId)],
    revalidate: DAY,
  })()
}
