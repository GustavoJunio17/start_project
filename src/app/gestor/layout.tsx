import { GestorLayoutClient } from './layout-client'

export const dynamic = 'force-dynamic'

export default function GestorLayout({ children }: { children: React.ReactNode }) {
  return <GestorLayoutClient>{children}</GestorLayoutClient>
}
