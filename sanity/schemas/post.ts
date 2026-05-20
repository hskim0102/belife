import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: '소식',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '제목', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'URL 슬러그', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'category', title: '카테고리', type: 'string', options: { list: [{ title: '공지사항', value: 'notice' }, { title: '활동소식', value: 'activity' }] }, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'thumbnail', title: '썸네일 이미지', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'excerpt', title: '요약', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: '본문', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  orderings: [{ title: '최신순', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'thumbnail' } },
})
