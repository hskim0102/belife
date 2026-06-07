'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useCallback, useRef, useState } from 'react'

/**
 * 게시판 본문 작성용 tiptap 에디터.
 * - StarterKit(제목/굵게/기울임/목록/인용 등) + 이미지 + 링크
 * - 이미지는 /api/admin/upload 로 Vercel Blob 업로드 후 본문에 삽입
 * - 편집 내용을 HTML 로 직렬화해 hidden input(name) 에 담아 form 제출에 사용
 */
export function TiptapEditor({
  name,
  defaultValue = '',
}: {
  name: string
  defaultValue?: string
}) {
  const [html, setHtml] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      // StarterKit 에 link 가 포함되는 버전 대비 비활성화 후 별도 구성
      StarterKit.configure({ link: false }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, autolink: true }),
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

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = (await res.json()) as { url?: string; error?: string }
        if (res.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run()
        } else {
          alert(data.error ?? '이미지 업로드에 실패했습니다.')
        }
      } catch {
        alert('이미지 업로드 중 오류가 발생했습니다.')
      } finally {
        setUploading(false)
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
        onSetLink={setLink}
        uploading={uploading}
      />
      <EditorContent editor={editor} />
      {/* form 제출용 직렬화 HTML */}
      <input type="hidden" name={name} value={html} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) void uploadImage(f)
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

function Toolbar({
  editor,
  onPickImage,
  onSetLink,
  uploading,
}: {
  editor: Editor | null
  onPickImage: () => void
  onSetLink: () => void
  uploading: boolean
}) {
  if (!editor) {
    return <div className="h-11 border-b border-gray-100 bg-gray-50" />
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
      <Btn title="굵게" label="B" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
      <Btn title="기울임" label="i" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
      <Btn title="취소선" label="S" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
      <span className="w-px h-5 bg-gray-200 mx-1" />
      <Btn title="제목 2" label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
      <Btn title="제목 3" label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
      <span className="w-px h-5 bg-gray-200 mx-1" />
      <Btn title="글머리 목록" label="• 목록" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
      <Btn title="번호 목록" label="1. 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
      <Btn title="인용" label="❝" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
      <span className="w-px h-5 bg-gray-200 mx-1" />
      <Btn title="링크" label="🔗" onClick={onSetLink} active={editor.isActive('link')} />
      <button
        type="button"
        title="이미지 업로드"
        onClick={onPickImage}
        disabled={uploading}
        className="px-2.5 h-8 rounded text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {uploading ? '업로드 중…' : '🖼 이미지'}
      </button>
      <span className="w-px h-5 bg-gray-200 mx-1" />
      <Btn title="실행 취소" label="↶" onClick={() => editor.chain().focus().undo().run()} />
      <Btn title="다시 실행" label="↷" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  )
}
