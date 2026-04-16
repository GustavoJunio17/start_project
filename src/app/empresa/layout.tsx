import { EmpresaLayoutClient } from './layout-client'

export const dynamic = 'force-dynamic'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return <EmpresaLayoutClient>{children}</EmpresaLayoutClient>
}
