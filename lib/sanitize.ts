import 'server-only'
import sanitizeHtml from 'sanitize-html'

// 마이그레이션된 활동소식 본문(레거시 그누보드 cheditor HTML)과
// 관리자 tiptap 에디터가 만든 본문을 안전하게 렌더링하기 위한 정제기.
// - <img>(Blob/https) 와 기본 서식 태그는 허용
// - <script>, on*= 이벤트 핸들러, 위험 속성은 제거(sanitize-html 기본 동작)
// - width/height 속성은 제거해 prose가 반응형으로 크기를 제어하게 함(모바일 넘침 방지)
//
// style 은 통째로 열지 않고 아래 세 속성만, 값 형식까지 확인해서 통과시킨다.
// 에디터에 기능을 추가하면 여기 허용 목록도 같이 넓혀야 화면에 반영된다.

/** 색상: #rgb / #rrggbb / #rrggbbaa 와 rgb()·rgba() 표기 */
const COLOR_VALUES = [
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/,
]

/** 글자 크기: 숫자 + px/pt/em/rem (세 자리까지) */
const FONT_SIZE_VALUES = [/^\d{1,3}(?:\.\d+)?(?:px|pt|em|rem)$/]

/** 문단 정렬 */
const TEXT_ALIGN_VALUES = [/^(?:left|right|center|justify)$/]

/** style 속성을 허용할 태그들 */
const STYLED_TAGS = [
  'div',
  'p',
  'span',
  'td',
  'th',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'ul',
  'ol',
  'li',
]

const options: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'figure', 'figcaption', 'u'],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt'],
    ...Object.fromEntries(STYLED_TAGS.map(tag => [tag, ['style']])),
  },
  allowedStyles: {
    '*': {
      'text-align': TEXT_ALIGN_VALUES,
      color: COLOR_VALUES,
      'font-size': FONT_SIZE_VALUES,
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
