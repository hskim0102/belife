import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
