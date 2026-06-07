import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = join(__dirname, '..', '.env.local')
try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const posts = [
  { slug: 'notice-2025-summer-camp', title: '2025년 여름 의료봉사캠프 모집 안내', category: 'notice', publishedAt: '2025-06-01T09:00:00Z', excerpt: '제5기 생명사랑의료학교 여름 캠프에 참여할 자원봉사자를 모집합니다.', body: '제5기 생명사랑의료학교 여름 봉사캠프에 함께해주실 의료인 및 예비 의료인을 모집합니다.\n\n- 일정: 2025년 7월 21일 ~ 25일\n- 장소: 충북 보은 외 2개 지역\n- 모집: 의사 5명, 간호사 10명, 의대생 20명\n\n신청은 belife@belife.org로 이력서와 지원동기를 보내주세요.' },
  { slug: 'activity-2025-philippines-visit', title: '필리핀 파야타스 빈민 의료 지원 후기', category: 'activity', publishedAt: '2025-05-12T09:00:00Z', excerpt: '5월 3일~10일, 필리핀 파야타스 지역 어린이 230명 진료 완료.', body: '5월 3일부터 10일까지 필리핀 마닐라 파야타스 지역에서 진행한 의료봉사가 마무리되었습니다.\n\n- 진료 인원: 어린이 230명, 성인 145명\n- 주요 처방: 기생충약, 비타민, 항생제\n- 응급 후송: 2건' },
  { slug: 'notice-2025-donation-deduction', title: '2024년 기부금 세액공제 영수증 발급 안내', category: 'notice', publishedAt: '2025-01-15T09:00:00Z', excerpt: '연말정산 시즌, 기부금 영수증 발급 및 국세청 자료 제출 안내.', body: '2024년 한 해 동안 후원해주신 모든 분들께 깊이 감사드립니다.\n\n기부금 영수증은 1월 20일부터 국세청 연말정산 간소화 서비스에 자동 등록됩니다. 별도 종이 영수증이 필요하신 분은 belife@belife.org로 신청해주세요.' },
  { slug: 'activity-2025-migrant-flu', title: '이주민 인플루엔자 예방접종 사업 완료', category: 'activity', publishedAt: '2025-04-22T09:00:00Z', excerpt: '서울, 안산, 화성의 이주민 50여 명 대상 무료 독감 예방접종.', body: '4월 한 달간 수도권 이주민 노동자 52명에게 무료로 인플루엔자 백신을 접종했습니다.\n\n협력기관: 안산이주민센터, 화성외국인쉼터' },
  { slug: 'notice-2025-board-meeting', title: '2025년 정기 이사회 개최 결과', category: 'notice', publishedAt: '2025-03-30T09:00:00Z', excerpt: '2024년 결산보고 및 2025년 사업계획 의결.', body: '2025년 3월 28일 정기 이사회가 개최되어 다음 안건이 의결되었습니다.\n\n1. 2024년 결산 승인\n2. 2025년 사업계획 및 예산 승인\n3. 신규 이사 1인 선임' },
  { slug: 'activity-2025-elder-checkup', title: '저소득 어르신 정기 건강검진 후기', category: 'activity', publishedAt: '2025-04-05T09:00:00Z', excerpt: '서울 동대문구 어르신 80여 명 대상 무료 건강검진.', body: '동대문구 보건소와 협력하여 65세 이상 저소득 어르신 84명을 대상으로 무료 건강검진을 실시했습니다.\n\n- 검사 항목: 혈압, 혈당, 콜레스테롤, 청력, 시력\n- 사후 관리: 추가 정밀검사 필요 12명 연계' },
  { slug: 'notice-2025-volunteer-recruit', title: '연중 의료봉사 자원봉사자 상시 모집', category: 'notice', publishedAt: '2025-02-10T09:00:00Z', excerpt: '의료인·예비의료인 누구나 상시 지원 가능합니다.', body: '아름다운생명사랑은 연중 자원봉사자를 모집합니다.\n\n자격: 의사, 한의사, 치과의사, 약사, 간호사, 임상심리사, 의·치·한·약학과 학생\n\n문의: belife@belife.org' },
  { slug: 'activity-2025-school-launch', title: '제4기 생명사랑의료학교 개강', category: 'activity', publishedAt: '2025-03-15T09:00:00Z', excerpt: '의료인의 사회적 책임을 배우는 12주 과정 시작.', body: '제4기 생명사랑의료학교가 3월 15일 개강했습니다.\n\n- 수강생: 의대생·간호대생 28명\n- 과정: 12주, 매주 토요일 3시간\n- 내용: 의료선교, 빈곤의학, 봉사 실습' },
  { slug: 'notice-2025-annual-report', title: '2024 연차보고서 발행', category: 'notice', publishedAt: '2025-02-28T09:00:00Z', excerpt: '한 해 활동과 재정 공시를 담은 보고서 PDF 다운로드 가능.', body: '2024년 한 해 활동과 결산 내역을 담은 연차보고서가 발행되었습니다.\n\n주요 내용:\n- 국내외 의료봉사 활동 보고\n- 후원금 사용 내역 공시\n- 2025년 사업 계획' },
  { slug: 'activity-2025-cambodia-survey', title: '캄보디아 농촌 의료 실태 사전조사', category: 'activity', publishedAt: '2025-05-25T09:00:00Z', excerpt: '내년 신규 해외 사업지 발굴을 위한 현지 답사.', body: '2026년 신규 해외 의료지원 사업지 검토를 위해 캄보디아 시엠레아프 인근 농촌 마을 3곳을 답사했습니다.\n\n- 인구: 약 2,400명\n- 의료 접근성: 가장 가까운 보건소까지 평균 18km\n- 주요 질환: 호흡기 감염, 영양실조, 모성보건' },
]

const programs = [
  { slug: 'elder-medical-care', name: '저소득 어르신 의료 지원', category: 'domestic', sortOrder: 1, description: '경제적으로 어려운 어르신께 무료 진료, 정기 건강검진, 만성질환 관리를 제공합니다.', body: '서울·경기 지역 보건소·복지관과 협력하여 65세 이상 기초생활수급 어르신을 대상으로 합니다.\n\n- 무료 진료: 매월 둘째·넷째 토요일\n- 건강검진: 분기 1회\n- 만성질환 관리: 고혈압·당뇨 환자 1:1 케어' },
  { slug: 'child-welfare-clinic', name: '취약계층 어린이 건강 사업', category: 'domestic', sortOrder: 2, description: '결식·한부모·다문화 가정 어린이의 성장 발달과 정서 건강을 돕습니다.', body: '서울시 5개 자치구의 지역아동센터와 협력하여 진행합니다.\n\n- 영양 상담\n- 발달 평가\n- 정서 지원 프로그램' },
  { slug: 'migrant-health-support', name: '이주민·난민 의료 지원', category: 'domestic', sortOrder: 3, description: '의료보험에서 소외된 이주민 노동자와 난민의 1차 의료를 책임집니다.', body: '안산·화성·시화 지역 이주민 센터와 함께 무료 진료소를 운영합니다.\n\n- 진료 과목: 내과, 외과, 치과, 산부인과\n- 통역 지원: 8개 언어 (베트남, 태국, 중국 등)' },
  { slug: 'philippines-payatas', name: '필리핀 파야타스 빈민 의료', category: 'overseas', sortOrder: 4, description: '마닐라 쓰레기산 파야타스 지역 어린이·여성의 건강을 지원합니다.', body: '20년 가까이 지속해온 대표 해외 사업입니다.\n\n- 연 2회 의료봉사 파견\n- 현지 보건교사 양성\n- 어린이 영양 지원 (월 400가구)' },
  { slug: 'cambodia-rural-clinic', name: '캄보디아 농촌 보건소 운영', category: 'overseas', sortOrder: 5, description: '시엠레아프 인근 농촌에 보건소를 세우고 현지 의료인을 양성합니다.', body: '2024년 시범 사업 후 2026년부터 본격 운영 예정입니다.\n\n- 보건소 건립 2개소\n- 현지 간호사 채용 6명\n- 모자보건 우선' },
  { slug: 'mongolia-eyecare', name: '몽골 시력 회복 프로젝트', category: 'overseas', sortOrder: 6, description: '울란바토르·다르항 지역 백내장 환자 무료 수술 지원.', body: '몽골 의료선교회와 협력해 매년 5월·10월 안과 의료팀을 파견합니다.\n\n- 백내장 수술 연 80건\n- 안경 보급 연 300개' },
  { slug: 'life-love-medical-school', name: '생명사랑의료학교', category: 'education', sortOrder: 7, description: '의료인의 사회적 책임을 배우는 의대생·간호대생 대상 12주 과정.', body: '2022년 1기 개강 이후 매년 봄·가을 모집합니다.\n\n- 강의: 의료선교, 빈곤의학, 의료윤리\n- 실습: 국내외 봉사 동행\n- 멘토링: 현직 의사 1:1 지도' },
  { slug: 'volunteer-academy', name: '의료 자원봉사자 아카데미', category: 'education', sortOrder: 8, description: '일반 자원봉사자를 위한 기초 의료 지식·봉사 윤리 교육.', body: '의료 봉사를 처음 접하는 분들을 위한 4주 기초 과정입니다.\n\n- 매월 첫째 주 토요일 개강\n- 수료 후 활동 매칭' },
  { slug: 'global-health-fellowship', name: '국제보건 펠로우십', category: 'education', sortOrder: 9, description: '의료인을 대상으로 한 국제보건·열대의학 심화 과정.', body: '연 1회 모집, 6개월 과정. 수료 후 해외 파견 우선 기회 부여.\n\n- 강의: 열대의학, 인도적 위기 대응\n- 현장 실습: 필리핀 또는 캄보디아 4주' },
  { slug: 'community-health-leaders', name: '지역사회 보건지도자 양성', category: 'education', sortOrder: 10, description: '복지관·종교단체 활동가를 보건지도자로 양성하는 프로그램.', body: '비의료인 활동가도 지역 보건의 첫 접점이 될 수 있도록 돕습니다.\n\n- 응급처치, 만성질환 관리 기초\n- 의료기관 연계 실무' },
]

const milestones = [
  { year: 2003, month: 5, content: '아름다운생명사랑 창립 (창립이사회 개최)' },
  { year: 2005, month: 9, content: '필리핀 파야타스 의료봉사 첫 파견' },
  { year: 2008, month: 3, content: '저소득 어르신 정기 진료소 개설 (서울 동대문)' },
  { year: 2011, month: 11, content: '공익법인(구 지정기부금단체) 지정' },
  { year: 2015, month: 6, content: '이주민 의료지원 사업 시작 (안산)' },
  { year: 2018, month: 10, content: '몽골 시력 회복 프로젝트 1차 파견' },
  { year: 2022, month: 3, content: '생명사랑의료학교 1기 개강' },
  { year: 2023, month: 9, content: '창립 20주년 기념식 및 후원의 밤 개최' },
  { year: 2024, month: 4, content: '캄보디아 시범 사업 착수' },
  { year: 2025, month: 3, content: '누적 해외 지원 가구 400가구 돌파' },
]

const members = [
  { groupName: 'board', name: '김영진', position: '이사장 / 내과 전문의', sortOrder: 1 },
  { groupName: 'board', name: '박서연', position: '이사 / 가정의학과 전문의', sortOrder: 2 },
  { groupName: 'board', name: '이준호', position: '이사 / 보건학 박사', sortOrder: 3 },
  { groupName: 'board', name: '정혜수', position: '이사 / 변호사', sortOrder: 4 },
  { groupName: 'auditor', name: '최민석', position: '감사 / 공인회계사', sortOrder: 1 },
  { groupName: 'advisor', name: '강도현', position: '자문위원 / 외과 명예교수', sortOrder: 1 },
  { groupName: 'advisor', name: '윤지영', position: '자문위원 / 국제보건 전문가', sortOrder: 2 },
  { groupName: 'staff', name: '한소영', position: '사무국장', sortOrder: 1 },
  { groupName: 'staff', name: '서민재', position: '국내사업 담당', sortOrder: 2 },
  { groupName: 'staff', name: '오나래', position: '해외사업 담당', sortOrder: 3 },
]

const impactStats = [
  { value: '23', unit: '년', label: '활동 역사 (2003~)', sortOrder: 1 },
  { value: '4', unit: '기', label: '생명사랑의료학교 운영', sortOrder: 2 },
  { value: '400+', unit: '가구', label: '필리핀 빈민 지원', sortOrder: 3 },
  { value: '50+', unit: '명', label: '이주민 예방접종', sortOrder: 4 },
  { value: '80+', unit: '명', label: '어르신 정기 진료', sortOrder: 5 },
  { value: '28', unit: '명', label: '제4기 의료학교 수강생', sortOrder: 6 },
  { value: '12', unit: '개국', label: '해외 의료봉사 파견', sortOrder: 7 },
  { value: '230', unit: '명', label: '2025년 파야타스 어린이 진료', sortOrder: 8 },
  { value: '8', unit: '개', label: '협력 의료·복지 기관', sortOrder: 9 },
  { value: '1,200+', unit: '명', label: '누적 자원봉사 참여자', sortOrder: 10 },
]

const siteSettings = {
  donationBank: '국민은행',
  donationAccount: '123-456-789012',
  donationHolder: '아름다운생명사랑',
  contactEmail: 'belife@belife.org',
  phoneNumber: '02-1234-5678',
  address: '서울특별시 종로구 종로 123 5층',
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

try {
  await client.connect()
  await client.query('BEGIN')

  await client.query('TRUNCATE posts, programs, milestones, members, impact_stats RESTART IDENTITY CASCADE')

  for (const p of posts) {
    await client.query(
      `INSERT INTO posts (slug, title, category, published_at, excerpt, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [p.slug, p.title, p.category, p.publishedAt, p.excerpt, p.body],
    )
  }

  for (const p of programs) {
    await client.query(
      `INSERT INTO programs (slug, name, category, sort_order, description, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [p.slug, p.name, p.category, p.sortOrder, p.description, p.body],
    )
  }

  for (const m of milestones) {
    await client.query(
      `INSERT INTO milestones (year, month, content) VALUES ($1, $2, $3)`,
      [m.year, m.month, m.content],
    )
  }

  for (const m of members) {
    await client.query(
      `INSERT INTO members (group_name, name, position, sort_order) VALUES ($1, $2, $3, $4)`,
      [m.groupName, m.name, m.position, m.sortOrder],
    )
  }

  for (const s of impactStats) {
    await client.query(
      `INSERT INTO impact_stats (value, unit, label, sort_order) VALUES ($1, $2, $3, $4)`,
      [s.value, s.unit, s.label, s.sortOrder],
    )
  }

  await client.query(
    `UPDATE site_settings SET
       donation_bank=$1, donation_account=$2, donation_holder=$3,
       contact_email=$4, phone_number=$5, address=$6
     WHERE id=1`,
    [siteSettings.donationBank, siteSettings.donationAccount, siteSettings.donationHolder,
     siteSettings.contactEmail, siteSettings.phoneNumber, siteSettings.address],
  )

  await client.query('COMMIT')

  const counts = await client.query(`
    SELECT 'posts' AS t, COUNT(*)::int AS c FROM posts UNION ALL
    SELECT 'programs', COUNT(*)::int FROM programs UNION ALL
    SELECT 'milestones', COUNT(*)::int FROM milestones UNION ALL
    SELECT 'members', COUNT(*)::int FROM members UNION ALL
    SELECT 'impact_stats', COUNT(*)::int FROM impact_stats UNION ALL
    SELECT 'site_settings', COUNT(*)::int FROM site_settings
    ORDER BY t`)
  console.log('Seeded:')
  for (const r of counts.rows) console.log(`  ${r.t.padEnd(15)} ${r.c}`)
} catch (err) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('Seed failed:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
