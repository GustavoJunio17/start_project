'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Zap, Brain, Building2, Sparkles, ArrowRight,
  CheckCircle, Users, TrendingUp, Award, Shield,
  MessageCircle, BarChart3, Target, Rocket, Menu, X,
} from 'lucide-react'

interface Props {
  whatsapp: string
}

const FEATURES = [
  {
    icon: Brain, title: 'Avaliação DISC',
    desc: 'Match comportamental automático entre candidatos e o perfil ideal de cada vaga.',
    grad: 'from-[#00D4FF] to-[#0066FF]', glow: '#00D4FF',
  },
  {
    icon: BarChart3, title: 'Relatórios em tempo real',
    desc: 'Dashboards com métricas de funil, taxa de conversão e performance do processo seletivo.',
    grad: 'from-[#7B2FFF] to-[#0066FF]', glow: '#7B2FFF',
  },
  {
    icon: Sparkles, title: 'IA para triagem',
    desc: 'Algoritmos de ranking que ordenam automaticamente os melhores perfis para cada vaga.',
    grad: 'from-[#F59E0B] to-[#EF4444]', glow: '#F59E0B',
  },
  {
    icon: Building2, title: 'Multi-empresa',
    desc: 'Ambientes completamente isolados por empresa com controle granular de acessos.',
    grad: 'from-[#10B981] to-[#0066FF]', glow: '#10B981',
  },
  {
    icon: Target, title: 'Banco de talentos',
    desc: 'Repositório permanente de candidatos aprovados para contratações futuras mais ágeis.',
    grad: 'from-[#00D4FF] to-[#7B2FFF]', glow: '#00D4FF',
  },
  {
    icon: Shield, title: 'LGPD nativo',
    desc: 'Conformidade total com a Lei Geral de Proteção de Dados desde a arquitetura do sistema.',
    grad: 'from-[#10B981] to-[#7B2FFF]', glow: '#10B981',
  },
]

const STEPS = [
  {
    n: '01', icon: Rocket,
    title: 'Publique sua vaga',
    desc: 'Configure requisitos, competências, nível de senioridade e o perfil DISC ideal em minutos.',
  },
  {
    n: '02', icon: Users,
    title: 'Candidatos se inscrevem',
    desc: 'Candidatos aplicam e completam a avaliação comportamental de forma totalmente automática.',
  },
  {
    n: '03', icon: Brain,
    title: 'IA filtra e ranqueia',
    desc: 'O sistema ordena os melhores perfis por compatibilidade técnica e comportamental.',
  },
  {
    n: '04', icon: Award,
    title: 'Você entrevista os melhores',
    desc: 'Foque somente nos candidatos ideais e tome decisões de contratação com dados concretos.',
  },
]

const PLANS = [
  {
    name: 'Essencial',
    tag: null,
    highlight: false,
    desc: 'Para pequenas empresas começando no recrutamento estruturado.',
    items: [
      'Até 3 vagas simultâneas',
      'Avaliação DISC básica',
      '2 recrutadores',
      'Painel de candidatos',
      'Suporte por e-mail',
    ],
    msg: 'Olá! Tenho interesse no plano Essencial da Start Pro. Pode me contar mais?',
  },
  {
    name: 'Profissional',
    tag: 'Mais popular',
    highlight: true,
    desc: 'Para equipes de RH que buscam velocidade e precisão na contratação.',
    items: [
      'Vagas ilimitadas',
      'DISC completo + match automático',
      '10 recrutadores',
      'Triagem e ranking por IA',
      'Relatórios avançados',
      'Banco de talentos',
      'Suporte prioritário',
    ],
    msg: 'Olá! Tenho interesse no plano Profissional da Start Pro. Pode me contar mais?',
  },
  {
    name: 'Enterprise',
    tag: 'Personalizado',
    highlight: false,
    desc: 'Para empresas com escala, múltiplas filiais e integrações avançadas.',
    items: [
      'Tudo do Profissional',
      'Multi-filial ilimitado',
      'API e webhooks próprios',
      'Customização de marca',
      'SLA garantido',
      'Gerente de conta dedicado',
    ],
    msg: 'Olá! Tenho interesse no plano Enterprise da Start Pro. Pode me contar mais?',
  },
]

export default function LandingPage({ whatsapp }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const wa = (msg: string) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`

  useEffect(() => {
    let mounted = true
    const loadGsap = async () => {
      try {
        const { gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
          const elements = root.current?.querySelectorAll('.reveal-on-scroll')
          elements?.forEach((el) => {
            if (mounted) {
              gsap.fromTo(el,
                { opacity: 0, y: 20, scale: 0.98 },
                {
                  opacity: 1, y: 0, scale: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    once: true,
                  }
                }
              )
            }
          })
        }, root)
        return () => ctx.revert()
      } catch (e) {
        console.warn('GSAP animations unavailable, using CSS fallback')
      }
    }

    loadGsap()
    return () => { mounted = false }
  }, [])

  return (
    <div ref={root} className="min-h-screen bg-[#050816] text-white flex flex-col overflow-x-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-[#00D4FF]/5 blur-[120px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#7B2FFF]/5 blur-[120px] animate-pulse" style={{ animationDuration: '6.5s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[20vw] h-[20vw] rounded-full bg-[#0066FF]/5 blur-[100px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="lp-dot-grid" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 50% at 50% -5%, rgba(0,212,255,0.07) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="lp-header fixed top-0 left-0 right-0 z-50 px-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-3.5">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center shadow-md shadow-[#00D4FF]/25">
                <Zap size={15} className="text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                START <span className="text-[#00D4FF]">PRO</span>
                <sup className="text-[10px] text-gray-500 font-normal ml-0.5">5.0</sup>
              </span>
            </div>

            {/* Nav — desktop */}
            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: 'Vagas',    href: '/vagas' },
                { label: 'Recursos', href: '#features' },
                { label: 'Planos',   href: '#plans' },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00D4FF] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Actions — desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="lp-btn-primary flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold"
              >
                Começar
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <nav className="flex flex-col gap-4 mb-4">
                {[
                  { label: 'Vagas',    href: '/vagas' },
                  { label: 'Recursos', href: '#features' },
                  { label: 'Planos',   href: '#plans' },
                ].map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors py-2">
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="lp-btn-primary flex items-center justify-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-lg font-semibold w-full"
                >
                  Começar
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-24 text-center">

          <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out hero-badge mb-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/[0.06] text-[#00D4FF] text-sm font-medium">
            <Sparkles size={13} />
            Plataforma de recrutamento com IA
          </div>

          <h1 className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out hero-title max-w-5xl text-5xl sm:text-6xl md:text-[74px] font-bold leading-[1.06] tracking-tight mb-6">
            Encontre os{' '}
            <span className="lp-shimmer">talentos ideais</span>
            <br />para sua empresa
          </h1>

          <p className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out hero-sub max-w-xl text-lg text-gray-400 leading-relaxed mb-10">
            Avaliação DISC, testes técnicos e ranking por IA.
            <br className="hidden sm:block" />
            Contrate com precisão, em menos tempo.
          </p>

          <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out hero-ctas flex flex-col sm:flex-row gap-3 mb-20">
            <Link
              href="/auth/register"
              className="lp-btn-primary group flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-xl font-semibold text-[15px]"
            >
              Candidatar-se
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="lp-btn-ghost flex items-center justify-center gap-2 px-7 py-4 border border-white/10 bg-white/[0.025] text-white rounded-xl font-semibold text-[15px] backdrop-blur-sm"
            >
              Acessar Painel
            </Link>
            <a
              href={wa('Olá! Tenho interesse na Start Pro para minha empresa. Pode me ajudar?')}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-btn-ghost flex items-center justify-center gap-2 px-7 py-4 border border-[#25D366]/30 bg-[#25D366]/[0.06] text-[#25D366] rounded-xl font-semibold text-[15px] backdrop-blur-sm hover:border-[#25D366]/50"
            >
              <MessageCircle size={15} />
              Para empresas
            </a>
          </div>

          {/* Stats */}
          <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
            {[
              { icon: Building2,   val: '500+',  lbl: 'Empresas ativas' },
              { icon: Users,       val: '12k+',  lbl: 'Candidatos avaliados' },
              { icon: Award,       val: '3.2k+', lbl: 'Contratações' },
              { icon: TrendingUp,  val: '94%',   lbl: 'Taxa de match' },
            ].map(({ icon: Icon, val, lbl }) => (
              <div
                key={lbl}
                className="hero-stat flex flex-col items-center p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
              >
                <Icon size={14} className="text-[#00D4FF] mb-2 opacity-60" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#0066FF] bg-clip-text text-transparent">
                  {val}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 text-center leading-tight">{lbl}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="features-section py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out sec-hd text-center mb-16">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00D4FF] mb-3">Recursos</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Tudo que você precisa para contratar melhor
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Uma plataforma completa que cobre todo o ciclo de recrutamento, da publicação ao onboarding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, idx) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out feat-card group relative flex flex-col p-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] overflow-hidden cursor-default"
                  >
                    <div
                      className="absolute top-0 inset-x-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${f.glow}55, transparent)` }}
                    />
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.grad} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                      style={{ boxShadow: `0 8px 24px -6px ${f.glow}45` }}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed flex-1">{f.desc}</p>
                    <div
                      className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg, transparent, ${f.glow}65, transparent)` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section className="steps-section py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out text-center mb-16">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00D4FF] mb-3">
                Como funciona
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Da publicação à contratação em 4 etapas
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Processo simples, resultado preciso. Sem planilhas, sem subjetividade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.n}
                    className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out step-item group flex gap-5 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#00D4FF]/15"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/15 to-[#0066FF]/15 border border-[#00D4FF]/20 flex items-center justify-center group-hover:border-[#00D4FF]/40 group-hover:from-[#00D4FF]/20 group-hover:to-[#0066FF]/20 transition-all duration-300">
                        <Icon size={20} className="text-[#00D4FF]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#00D4FF]/50 mb-1 tracking-[0.15em]">{s.n}</p>
                      <h3 className="font-semibold mb-1.5">{s.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Planos ── */}
        <section id="plans" className="plans-section py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out plan-hd text-center mb-16">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00D4FF] mb-3">Planos</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Invista no melhor recrutamento
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Fale com nosso time e descubra o plano ideal para o porte e as necessidades da sua empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {PLANS.map((p, idx) => (
                <div
                  key={p.name}
                  className={`reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out plan-card relative flex flex-col rounded-2xl border overflow-hidden hover:-translate-y-1 ${
                    p.highlight
                      ? 'border-[#00D4FF]/40 bg-gradient-to-b from-[#00D4FF]/[0.08] to-[#0066FF]/[0.04] shadow-2xl shadow-[#00D4FF]/10'
                      : 'border-white/[0.07] bg-white/[0.025]'
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    {p.tag && (
                      <div
                        className={`self-start mb-4 px-3 py-1 rounded-full text-[11px] font-semibold ${
                          p.highlight
                            ? 'bg-[#00D4FF]/20 text-[#00D4FF]'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {p.tag}
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">{p.desc}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {p.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                          <CheckCircle size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={wa(p.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                        p.highlight
                          ? 'bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white hover:shadow-lg hover:shadow-[#00D4FF]/30'
                          : 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <MessageCircle size={14} />
                      Falar com especialista
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              * Todos os planos incluem avaliação DISC, painel de candidatos e relatórios básicos.
              Preços sob consulta conforme porte da empresa.
            </p>
          </div>
        </section>

        {/* ── CTA Empresa ── */}
        <section className="contact-section py-28 px-6">
          <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500 ease-out max-w-3xl mx-auto text-center">
            <div className="contact-inner relative flex flex-col items-center p-10 md:p-14 rounded-3xl border border-[#00D4FF]/15 bg-gradient-to-b from-[#00D4FF]/[0.06] to-transparent overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/45 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0066FF]/25 to-transparent" />

              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center mb-6"
                style={{ boxShadow: '0 20px 50px -10px rgba(0,212,255,0.35)' }}
              >
                <Building2 size={24} className="text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Sua empresa pronta para contratar melhor?
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl">
                Fale diretamente com nosso time e descubra como a Start Pro pode transformar
                o recrutamento da sua organização — sem compromisso.
              </p>

              <a
                href={wa('Olá! Sou de uma empresa e tenho interesse na Start Pro. Pode me contar mais sobre a plataforma?')}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn-primary inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0066FF] text-white rounded-xl font-semibold text-[15px]"
              >
                <MessageCircle size={18} />
                Falar com nossa equipe no WhatsApp
                <ArrowRight size={15} />
              </a>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {['Resposta em até 2h', 'Demo personalizada', 'Sem compromisso'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle size={12} className="text-[#10B981]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer relative z-10 border-t border-white/[0.05] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500">
              Start PRO <span className="text-gray-700">5.0</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: 'Vagas',     href: '/vagas' },
              { label: 'Entrar',    href: '/auth/login' },
              { label: 'Cadastrar', href: '/auth/register' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Shield size={11} />
            © {new Date().getFullYear()} Start Pro — LGPD compliant
          </div>
        </div>
      </footer>
    </div>
  )
}
