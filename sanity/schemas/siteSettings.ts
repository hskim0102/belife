import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: '사이트 설정',
  type: 'document',
  fields: [
    defineField({ name: 'donationBank', title: '후원 은행명', type: 'string' }),
    defineField({ name: 'donationAccount', title: '후원 계좌번호', type: 'string' }),
    defineField({ name: 'donationHolder', title: '예금주', type: 'string' }),
    defineField({ name: 'contactEmail', title: '이메일', type: 'string' }),
    defineField({ name: 'phoneNumber', title: '전화번호', type: 'string' }),
    defineField({ name: 'address', title: '주소', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: '사이트 설정' }) },
})
