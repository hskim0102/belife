import 'server-only'
import sanitizeHtml from 'sanitize-html'

// 마이그레이션된 활동소식 본문(레거시 그누보드 cheditor HTML)을 안전하게 렌더링하기 위한 정제기.
// - <img>(Blob/https) 와 기본 서식 태그는 허용
// - <script>, on*= 이벤트 핸들러, 위험 속성은 제거(sanitize-html 기본 동작)
// - width/height 속성은 제거해 prose가 반응형으로 크기를 제어하게 함(모바일 넘침 방지)
const options: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'figure', 'figcaption', 'u'],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt'],
    // 가운데 정렬 등 본문 레이아웃 유지를 위해 style 만 제한적으로 허용
    div: ['style'],
    p: ['style'],
    span: ['style'],
    td: ['style'],
    th: ['style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  // 이미지 src 는 http/https 만 허용
  allowedSchemesByTag: { img: ['http', 'https'], a: ['http', 'https', 'mailto'] },
  // 외부 링크 안전화
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
}

/** 활동소식 본문 HTML을 정제해 dangerouslySetInnerHTML 로 안전하게 렌더링 가능한 문자열로 반환. */
export function sanitizePostBody(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, options)
}
