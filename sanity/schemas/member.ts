import { defineField, defineType } from 'sanity'

export const member = defineType({
  name: 'member',
  title: '함께하는 사람들',
  type: 'document',
  fields: [
    defineField({ name: 'group', title: '구분', type: 'string', options: { list: [{ title: '이사회', value: 'board' }, { title: '감사', value: 'auditor' }, { title: '자문위원', value: 'advisor' }, { title: '상근자', value: 'staff' }] }, validation: r => r.required() }),
    defineField({ name: 'name', title: '이름', type: 'string', validation: r => r.required() }),
    defineField({ name: 'position', title: '직책/소속', type: 'string' }),
    defineField({ name: 'order', title: '정렬 순서', type: 'number' }),
  ],
  preview: { select: { title: 'name', subtitle: 'position' } },
})
