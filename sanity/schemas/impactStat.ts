import { defineField, defineType } from 'sanity'

export const impactStat = defineType({
  name: 'impactStat',
  title: '임팩트 수치',
  type: 'document',
  fields: [
    defineField({ name: 'value', title: '숫자', type: 'string', validation: r => r.required() }),
    defineField({ name: 'unit', title: '단위', type: 'string' }),
    defineField({ name: 'label', title: '설명 라벨', type: 'string', validation: r => r.required() }),
    defineField({ name: 'order', title: '순서', type: 'number' }),
  ],
  preview: { select: { title: 'label', subtitle: 'value' } },
})
