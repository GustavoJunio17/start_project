import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "START PRO 5.0",
  description: "Plataforma de Recrutamento, Treinamento e Desenvolvimento de Pessoas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased theme-dark`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
