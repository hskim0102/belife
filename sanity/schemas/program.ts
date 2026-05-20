import { defineField, defineType } from 'sanity'

export const program = defineType({
  name: 'program',
  title: '사업',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: '사업명', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'URL 슬러그', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'category', title: '구분', type: 'string', options: { list: [{ title: '국내', value: 'domestic' }, { title: '해외', value: 'overseas' }, { title: '교육', value: 'education' }] }, validation: r => r.required() }),
    defineField({ name: 'order', title: '정렬 순서', type: 'number' }),
    defineField({ name: 'thumbnail', title: '썸네일', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: '짧은 설명', type: 'text', rows: 2, validation: r => r.required() }),
    defineField({ name: 'body', title: '상세 내용', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] }),
  ],
  preview: { select: { title: 'name', subtitle: 'category', media: 'thumbnail' } },
})
