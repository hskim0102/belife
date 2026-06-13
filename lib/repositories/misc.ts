import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { ImpactStat, Member, Milestone, SiteSettings } from '@/lib/types'

interface MilestoneRow extends QueryResultRow {
  id: number
  year: number
  month: number
  content: string
}

export async function getMilestones(): Promise<Milestone[]> {
  const rows = await query<MilestoneRow>(
    `SELECT id, year, month, content
       FROM milestones
       ORDER BY year DESC, month DESC, id DESC`,
  )
  return rows.map(r => ({ id: r.id, year: r.year, month: r.month, content: r.content }))
}

interface MemberRow extends QueryResultRow {
  id: number
  group_name: Member['group']
  name: string
  position: string | null
  sort_order: number
}

export async function getMembers(): Promise<Member[]> {
  const rows = await query<MemberRow>(
    `SELECT id, group_name, name, position, sort_order
       FROM members
       ORDER BY group_name ASC, sort_order ASC, id ASC`,
  )
  return rows.map(r => ({
    id: r.id,
    group: r.group_name,
    name: r.name,
    position: r.position,
    order: r.sort_order,
  }))
}

// ── 관리자 CRUD (함께하는 사람들 / 발자취) ──────────────────────────────────

function toMember(r: MemberRow): Member {
  return { id: r.id, group: r.group_name, name: r.name, position: r.position, order: r.sort_order }
}

export interface MemberInput {
  group: Member['group']
  name: string
  position: string | null
  order: number
}

export async function getMemberById(id: number): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `SELECT id, group_name, name, position, sort_order FROM members WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toMember(row) : null
}

export async function createMember(input: MemberInput): Promise<Member> {
  const row = await queryOne<MemberRow>(
    `INSERT INTO members (group_name, name, position, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, group_name, name, position, sort_order`,
    [input.group, input.name, input.position, input.order],
  )
  if (!row) throw new Error('멤버 등록 실패 (데이터베이스 미연결)')
  return toMember(row)
}

export async function updateMember(id: number, input: MemberInput): Promise<Member | null> {
  const row = await queryOne<MemberRow>(
    `UPDATE members
        SET group_name = $2, name = $3, position = $4, sort_order = $5
      WHERE id = $1
      RETURNING id, group_name, name, position, sort_order`,
    [id, input.group, input.name, input.position, input.order],
  )
  return row ? toMember(row) : null
}

export async function deleteMember(id: number): Promise<void> {
  await query(`DELETE FROM members WHERE id = $1`, [id])
}

export interface MilestoneInput {
  year: number
  month: number
  content: string
}

export async function getMilestoneById(id: number): Promise<Milestone | null> {
  const row = await queryOne<MilestoneRow>(
    `SELECT id, year, month, content FROM milestones WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? { id: row.id, year: row.year, month: row.month, content: row.content } : null
}

export async function createMilestone(input: MilestoneInput): Promise<Milestone> {
  const row = await queryOne<MilestoneRow>(
    `INSERT INTO milestones (year, month, content)
       VALUES ($1, $2, $3)
       RETURNING id, year, month, content`,
    [input.year, input.month, input.content],
  )
  if (!row) throw new Error('발자취 등록 실패 (데이터베이스 미연결)')
  return { id: row.id, year: row.year, month: row.month, content: row.content }
}

export async function updateMilestone(id: number, input: MilestoneInput): Promise<Milestone | null> {
  const row = await queryOne<MilestoneRow>(
    `UPDATE milestones
        SET year = $2, month = $3, content = $4
      WHERE id = $1
      RETURNING id, year, month, content`,
    [id, input.year, input.month, input.content],
  )
  return row ? { id: row.id, year: row.year, month: row.month, content: row.content } : null
}

export async function deleteMilestone(id: number): Promise<void> {
  await query(`DELETE FROM milestones WHERE id = $1`, [id])
}

interface ImpactStatRow extends QueryResultRow {
  id: number
  value: string
  unit: string | null
  label: string
  sort_order: number
}

export async function getImpactStats(): Promise<ImpactStat[]> {
  const rows = await query<ImpactStatRow>(
    `SELECT id, value, unit, label, sort_order
       FROM impact_stats
       ORDER BY sort_order ASC, id ASC`,
  )
  return rows.map(r => ({
    id: r.id,
    value: r.value,
    unit: r.unit,
    label: r.label,
    order: r.sort_order,
  }))
}

interface SiteSettingsRow extends QueryResultRow {
  donation_bank: string | null
  donation_account: string | null
  donation_holder: string | null
  contact_email: string | null
  phone_number: string | null
  address: string | null
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const row = await queryOne<SiteSettingsRow>(
    `SELECT donation_bank, donation_account, donation_holder,
            contact_email, phone_number, address
       FROM site_settings
       WHERE id = 1
       LIMIT 1`,
  )
  if (!row) return null
  return {
    donationBank: row.donation_bank,
    donationAccount: row.donation_account,
    donationHolder: row.donation_holder,
    contactEmail: row.contact_email,
    phoneNumber: row.phone_number,
    address: row.address,
  }
}
