'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { useCallback, useRef, useState } from 'react'

/**
 * 게시판 본문 작성용 tiptap 에디터.
 * - StarterKit(제목/굵게/기울임/목록/인용 등) + 이미지 + 링크
 * - 글자 크기·색상·정렬은 lib/sanitize.ts 의 허용 목록과 짝을 이룬다.
 *   (여기서 넣을 수 있어도 정제기가 막으면 공개 페이지에서 지워진다)
 * - 이미지는 /api/admin/upload 로 Vercel Blob 업로드 후 본문에 삽입
 * - 편집 내용을 HTML 로 직렬화해 hidden input(name) 에 담아 form 제출에 사용
 */

/** 글자 크기 선택지. 빈 문자열은 '기본'(크기 지정 없음). */
const FONT_SIZES = [
  { value: '', label: '기본' },
  { value: '14px', label: '작게' },
  { value: '18px', label: '크게' },
  { value: '24px', label: '더 크게' },
  { value: '32px', label: '제목급' },
]

/** 자주 쓰는 글자 색. 정제기가 #rrggbb 형식만 통과시키므로 값 형식을 맞춘다. */
const TEXT_COLORS = [
  { value: '#111827', label: '검정' },
  { value: '#6b7280', label: '회색' },
  { value: '#dc2626', label: '빨강' },
  { value: '#ea580c', label: '주황' },
  { value: '#ca8a04', label: '노랑' },
  { value: '#16a34a', label: '초록' },
  { value: '#2563eb', label: '파랑' },
  { value: '#7c3aed', label: '보라' },
]

/** 첨부 가능한 확장자. lib/blob.ts 의 ATTACHMENT_TYPES 와 맞춘다. */
const ATTACHMENT_ACCEPT =
  '.pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.jpg,.jpeg,.png,.gif,.webp,.avif'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export function TiptapEditor({
  name,
  defaultValue = '',
}: {
  name: string
  defaultValue?: string
}) {
  const [html, setHtml] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [attaching, setAttaching] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const attachRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      // StarterKit 에 link 가 포함되는 버전 대비 비활성화 후 별도 구성
      StarterKit.configure({ link: false }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: defaultValue,
    immediatelyRender: false, // Next SSR hydration mismatch 방지
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[340px] px-4 py-3 focus:outline-none prose-img:rounded-lg',
      },
    },
  })

  /** 여러 장을 고른 순서대로 올려 본문에 차례로 넣는다. */
  const uploadImages = useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return
      setUploading(true)
      const failed: string[] = []
      try {
        for (const file of files) {
          try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
            const data = (await res.json()) as { url?: string; error?: string }
            if (res.ok && data.url) {
              editor.chain().focus().setImage({ src: data.url }).run()
            } else {
              failed.push(`${file.name}: ${data.error ?? '업로드 실패'}`)
            }
          } catch {
            failed.push(`${file.name}: 업로드 중 오류`)
          }
        }
      } finally {
        setUploading(false)
      }
      if (failed.length > 0) {
        alert(`일부 이미지를 올리지 못했습니다.\n\n${failed.join('\n')}`)
      }
    },
    [editor],
  )

  /** 첨부파일을 올려 본문에 내려받기 링크로 넣는다. */
  const attachFiles = useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return
      setAttaching(true)
      const failed: string[] = []
      try {
        for (const file of files) {
          try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/admin/upload-file', { method: 'POST', body: fd })
            const data = (await res.json()) as {
              url?: string
              name?: string
              size?: number
              error?: string
            }
            if (res.ok && data.url) {
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: `📎 ${data.name ?? file.name} (${formatBytes(data.size ?? file.size)})`,
                      marks: [{ type: 'link', attrs: { href: data.url } }],
                    },
                  ],
                })
                .run()
            } else {
              failed.push(`${file.name}: ${data.error ?? '업로드 실패'}`)
            }
          } catch {
            failed.push(`${file.name}: 업로드 중 오류`)
          }
        }
      } finally {
        setAttaching(false)
      }
      if (failed.length > 0) {
        alert(`일부 파일을 첨부하지 못했습니다.\n\n${failed.join('\n')}`)
      }
    },
    [editor],
  )

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('링크 URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Toolbar
        editor={editor}
        onPickImage={() => fileRef.current?.click()}
        onPickAttachment={() => attachRef.current?.click()}
        onSetLink={setLink}
        uploading={uploading}
        attaching={attaching}
      />
      <EditorContent editor={editor} />
      {/* form 제출용 직렬화 HTML */}
      <input type="hidden" name={name} value={html} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) void uploadImages(files)
          e.target.value = ''
        }}
      />
      <input
        ref={attachRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) void attachFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function Btn({
  onClick,
  active,
  label,
  title,
}: {
  onClick: () => void
  active?: boolean
  label: string
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2.5 h-8 rounded text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-1" />
}

function Toolbar({
  editor,
  onPickImage,
  onPickAttachment,
  onSetLink,
  uploading,
  attaching,
}: {
  editor: Editor | null
  onPickImage: () => void
  onPickAttachment: () => void
  onSetLink: () => void
  uploading: boolean
  attaching: boolean
}) {
  if (!editor) {
    return <div className="h-11 border-b border-gray-100 bg-gray-50" />
  }

  const currentSize = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? ''
  const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? ''

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
      <Btn title="굵게" label="B" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
      <Btn title="기울임" label="i" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
      <Btn title="취소선" label="S" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
      <Divider />
      <Btn title="제목 2" label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
      <Btn title="제목 3" label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />

      <Divider />
      {/* 글자 크기 */}
      <select
        title="글자 크기"
        aria-label="글자 크기"
        value={currentSize}
        onChange={e => {
          const size = e.target.value
          if (size) editor.chain().focus().setFontSize(size).run()
          else editor.chain().focus().unsetFontSize().run()
        }}
        className="h-8 px-2 rounded text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {FONT_SIZES.map(s => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* 글자 색 */}
      <div className="flex items-center gap-0.5 ml-1">
        {TEXT_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            title={`글자색 ${c.label}`}
            aria-label={`글자색 ${c.label}`}
            onClick={() => editor.chain().focus().setColor(c.value).run()}
            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
              currentColor.toLowerCase() === c.value ? 'ring-2 ring-offset-1 ring-gray-400 border-white' : 'border-gray-300'
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
        <Btn title="글자색 지우기" label="⌫" onClick={() => editor.chain().focus().unsetColor().run()} />
      </div>

      <Divider />
      {/* 문단 정렬 */}
      <Btn title="왼쪽 정렬" label="⇤" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
      <Btn title="가운데 정렬" label="↔" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
      <Btn title="오른쪽 정렬" label="⇥" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
      <Btn title="양쪽 정렬" label="≡" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />

      <Divider />
      <Btn title="글머리 목록" label="• 목록" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
      <Btn title="번호 목록" label="1. 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
      <Btn title="인용" label="❝" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
      <Divider />
      <Btn title="링크" label="🔗" onClick={onSetLink} active={editor.isActive('link')} />
      <button
        type="button"
        title="이미지 업로드 (여러 장 선택 가능)"
        onClick={onPickImage}
        disabled={uploading}
        className="px-2.5 h-8 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {uploading ? '업로드 중…' : '🖼 이미지'}
      </button>
      <button
        type="button"
        title="첨부파일 (PDF·한글·오피스·이미지, 4MB 이하, 여러 개 선택 가능)"
        onClick={onPickAttachment}
        disabled={attaching}
        className="px-2.5 h-8 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {attaching ? '첨부 중…' : '📎 첨부'}
      </button>
      <Divider />
      <Btn title="실행 취소" label="↶" onClick={() => editor.chain().focus().undo().run()} />
      <Btn title="다시 실행" label="↷" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  )
}
