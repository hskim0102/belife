import { defineField, defineType } from 'sanity'

export const milestone = defineType({
  name: 'milestone',
  title: '발자취',
  type: 'document',
  fields: [
    defineField({ name: 'year', title: '연도', type: 'number', validation: r => r.required().min(2006).max(2100) }),
    defineField({ name: 'month', title: '월', type: 'number', validation: r => r.required().min(1).max(12) }),
    defineField({ name: 'content', title: '내용', type: 'text', rows: 2, validation: r => r.required() }),
  ],
  orderings: [{ title: '최신순', name: 'dateDesc', by: [{ field: 'year', direction: 'desc' }, { field: 'month', direction: 'desc' }] }],
  preview: { select: { title: 'content', subtitle: 'year' } },
})
