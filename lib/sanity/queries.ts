import { client } from './client'
import type { Post, Program, Milestone, Member, ImpactStat, SiteSettings } from './types'

export async function getRecentPosts(limit = 3): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] { _id, title, slug, category, publishedAt, thumbnail, excerpt }`,
    { limit: limit - 1 }
  )
}

export async function getAllPosts(): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) { _id, title, slug, category, publishedAt, thumbnail, excerpt }`
  )
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug }
  )
}

export async function getAllPrograms(): Promise<Program[]> {
  return client.fetch(
    `*[_type == "program"] | order(order asc) { _id, name, slug, category, thumbnail, description }`
  )
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  return client.fetch(
    `*[_type == "program" && slug.current == $slug][0]`,
    { slug }
  )
}

export async function getMilestones(): Promise<Milestone[]> {
  return client.fetch(
    `*[_type == "milestone"] | order(year desc, month desc) { _id, year, month, content }`
  )
}

export async function getMembers(): Promise<Member[]> {
  return client.fetch(
    `*[_type == "member"] | order(order asc) { _id, group, name, position }`
  )
}

export async function getImpactStats(): Promise<ImpactStat[]> {
  return client.fetch(
    `*[_type == "impactStat"] | order(order asc) { _id, value, unit, label }`
  )
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(`*[_type == "siteSettings"][0]`)
}
