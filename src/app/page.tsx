import LandingPage from '@/components/landing/LandingPage'

export default function Home() {
  const whatsapp = process.env.WHATSAPP_NUMBER ?? '5511999999999'
  return <LandingPage whatsapp={whatsapp} />
}
