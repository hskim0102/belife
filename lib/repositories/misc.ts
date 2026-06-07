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
