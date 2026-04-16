import { CandidatoLayoutClient } from './layout-client'

export const dynamic = 'force-dynamic'

export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  return <CandidatoLayoutClient>{children}</CandidatoLayoutClient>
}
