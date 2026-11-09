import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Type,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCinematicTransitions } from './animations/useCinematicTransitions'
import SceneExperience from './components/SceneExperience'
import ServiceAreas from './components/ServiceAreas'
import { servicePanels } from './components/servicePanels'
import './App.css'

const contactEmail = 'paulinx42@icloud.com'
const ContactScene = lazy(() =>
  import('./components/ServiceScene3D').then((module) => ({
    default: module.ContactScene3D,
  })),
)
const emailLink =
  'mailto:paulinx42@icloud.com?subject=Solicita%C3%A7%C3%A3o%20de%20Consultoria%20%E2%80%94%20Future%20Engineering'
const whatsappMessage =
  'Olá! Gostaria de solicitar informações sobre os serviços da Future Engineering.'
const whatsappLink = `https://wa.me/5581981448976?text=${encodeURIComponent(whatsappMessage)}`
const TEXT_SCALE_STORAGE_KEY = 'future-engineering-text-scale'
const textScaleOptions = [
  { value: 'small', label: 'A−', description: 'Diminuir texto' },
  { value: 'normal', label: 'A', description: 'Texto padrão' },
  { value: 'large', label: 'A+', description: 'Aumentar texto' },
]

function readTextScalePreference() {
  try {
    const preference = window.localStorage.getItem(TEXT_SCALE_STORAGE_KEY)
    return textScaleOptions.some(({ value }) => value === preference)
      ? preference
      : 'normal'
  } catch (error) {
    console.warn('Não foi possível ler a preferência de tamanho do texto.', error)
    return 'normal'
  }
}

function BrandMark({ navigateTo }) {
  return (
    <button
      className="brand"
      type="button"
      aria-label="Voltar ao início"
      onClick={() => navigateTo(0)}
    >
      <span className="brand-symbol" aria-hidden="true">
        <span>PA</span>
        <span className="brand-divider" />
      </span>
      <span className="brand-name">ENGINEERING</span>
    </button>
  )
}

function SiteHeader({ activeIndex, navigateTo, textScale, onTextScaleChange }) {
  const panels = [
    { id: 'inicio', title: 'Início', shortTitle: 'Início' },
    ...servicePanels.map((service) => ({
      id: `area-${service.slug}`,
      title: service.title,
      shortTitle: service.shortTitle,
    })),
    { id: 'contato', title: 'Contato', shortTitle: 'Contato' },
  ]

  return (
    <header className="site-header">
      <div className="header-identity">
        <BrandMark navigateTo={navigateTo} />
        <div className="text-size-control" role="group" aria-label="Tamanho do texto">
          <Type size={14} aria-hidden="true" />
          {textScaleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.description}
              aria-pressed={textScale === option.value}
              onClick={() => onTextScaleChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <nav className="panel-menu" aria-label="Navegar por setores">
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            className={`panel-menu-item${activeIndex === index ? ' is-active' : ''}`}
            type="button"
            aria-current={activeIndex === index ? 'page' : undefined}
            aria-label={`${String(index + 1).padStart(2, '0')} — ${panel.title}`}
            onClick={() => navigateTo(index)}
          >
            <span className="panel-menu-index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{panel.shortTitle}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}

function ScenePanel({ active }) {
  return (
    <div className="scene-panel" aria-label="Visualização de componentes mecânicos">
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-topline" aria-hidden="true">
        <span>SISTEMA DE TRANSMISSÃO</span>
        <span>FIG. 01 — CONJUNTO MECÂNICO</span>
      </div>
      <div className="scene-visual">
        <SceneExperience active={active} />
      </div>
      <div className="scene-readout" aria-hidden="true">
        <span className="readout-rule" />
        <span>ENGENHARIA DE PRECISÃO</span>
      </div>
      <div className="scene-crosshair scene-crosshair-top" aria-hidden="true" />
      <div className="scene-crosshair scene-crosshair-bottom" aria-hidden="true" />
    </div>
  )
}

function HomePanel({ active }) {
  const shouldReduceMotion = useReducedMotion()
  const enterFromBelow = shouldReduceMotion ? false : { opacity: 0, y: 14 }
  const enterTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] }

  return (
    <section
      className={`experience-panel hero-section${active ? ' is-active' : ''}`}
      id="inicio"
      aria-labelledby="home-title"
      aria-hidden={!active}
      inert={!active}
    >
      <div className="panel-atmosphere" aria-hidden="true" />
      <div className="hero-layout panel-content">
        <div className="hero-copy panel-copy">
          <motion.p
            className="eyebrow panel-kicker"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={enterTransition}
          >
            <span className="eyebrow-line" aria-hidden="true" />
            CONSULTORIA · OPERAÇÕES · CONFIABILIDADE
          </motion.p>

          <motion.h1
            id="home-title"
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  delayChildren: shouldReduceMotion ? 0 : 0.08,
                  staggerChildren: shouldReduceMotion ? 0 : 0.1,
                },
              },
            }}
          >
            {['ENGENHARIA QUE', 'TRANSFORMA', 'COMPLEXIDADE EM', 'PRECISÃO.'].map(
              (line, index) => (
                <motion.span
                  key={line}
                  className={`hero-title-line${index === 3 ? ' hero-title-accent' : ''}`}
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: enterTransition,
                    },
                  }}
                >
                  {line}
                </motion.span>
              ),
            )}
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={enterFromBelow}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...enterTransition, delay: 0.18 }}
          >
            Consultoria em engenharia para evoluir a gestão operacional, otimizar
            processos e elevar a confiabilidade da manutenção.
          </motion.p>

          <motion.a
            className="primary-cta"
            href={emailLink}
            initial={enterFromBelow}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...enterTransition, delay: 0.28 }}
          >
            <span>SOLICITAR CONSULTORIA</span>
            <span className="cta-icon" aria-hidden="true">
              <ArrowUpRight size={18} strokeWidth={1.7} />
            </span>
          </motion.a>

          <motion.div
            className="hero-caption"
            initial={enterFromBelow}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...enterTransition, delay: 0.36 }}
          >
            <span className="caption-mark" aria-hidden="true" />
            <span>PRECISÃO EM CADA DECISÃO</span>
          </motion.div>
        </div>
        <ScenePanel active={active} />
      </div>
    </section>
  )
}

function ContactPanel({ active, reducedMotion }) {
  return (
    <section
      className={`experience-panel contact-panel${active ? ' is-active' : ''}`}
      id="contato"
      aria-labelledby="contact-title"
      aria-hidden={!active}
      inert={!active}
    >
      <div className="panel-atmosphere" aria-hidden="true" />
      <div className="contact-visual" aria-hidden="true">
        {active && (
          <Suspense fallback={null}>
            <ContactScene reducedMotion={reducedMotion} />
          </Suspense>
        )}
      </div>
      <div className="panel-content contact-content panel-copy">
        <p className="approach-eyebrow panel-kicker">
          <span className="eyebrow-line" aria-hidden="true" />
          PRÓXIMO PASSO
        </p>
        <p className="contact-index">06 / 06 — FUTURE ENGINEERING</p>
        <h2 id="contact-title">
          ENGENHARIA
          <br />
          PARA AVANÇAR.
        </h2>
        <p className="contact-description">
          Vamos conversar sobre os desafios da sua operação e encontrar caminhos
          para evoluir com segurança, clareza e precisão.
        </p>
        <div className="contact-actions">
          <a className="contact-action contact-action-email" href={emailLink}>
            <Mail size={17} strokeWidth={1.7} aria-hidden="true" />
            <span>
              <span className="contact-action-label">E-MAIL</span>
              <span className="contact-action-value">{contactEmail}</span>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a
            className="contact-action contact-action-whatsapp"
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>
              <span className="contact-action-label">WHATSAPP</span>
              <span className="contact-action-value">(81) 98144-8976</span>
            </span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <a
          className="contact-phone-link"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={13} aria-hidden="true" />
          <span>ABRIR CONVERSA NO WHATSAPP</span>
        </a>
        <p className="contact-signature">PA ENGINEERING · CONSULTORIA TÉCNICA</p>
      </div>
      <div className="contact-diagram" aria-hidden="true">
        <span className="contact-orbit contact-orbit-one" />
        <span className="contact-orbit contact-orbit-two" />
        <span className="contact-core">FE</span>
        <span className="contact-coordinate">24° 02' 12.0&quot; S / 46° 31' 18.0&quot; W</span>
      </div>
    </section>
  )
}

function NavigationControls({ activeIndex, navigateTo }) {
  const lastIndex = servicePanels.length + 1
  const panelNames = ['Início', ...servicePanels.map(({ title }) => title), 'Contato']

  return (
    <footer className="navigation-controls" aria-label="Controles de navegação">
      <span className="navigation-position" aria-live="polite">
        <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
        <span> / {String(lastIndex + 1).padStart(2, '0')}</span>
      </span>
      <div className="navigation-progress" aria-hidden="true">
        <span style={{ '--progress': `${(activeIndex / lastIndex) * 100}%` }} />
      </div>
      <div className="navigation-dots" aria-label="Selecionar painel">
        {panelNames.map((name, index) => (
          <button
            key={name}
            type="button"
            className={`navigation-dot${activeIndex === index ? ' is-active' : ''}`}
            aria-label={`Ir para ${String(index + 1).padStart(2, '0')} — ${name}`}
            aria-current={activeIndex === index ? 'step' : undefined}
            onClick={() => navigateTo(index)}
          />
        ))}
      </div>
      <div className="navigation-arrows">
        <button
          type="button"
          aria-label="Painel anterior"
          disabled={activeIndex === 0}
          onClick={() => navigateTo(activeIndex - 1)}
        >
          <ArrowLeft size={17} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Próximo painel"
          disabled={activeIndex === lastIndex}
          onClick={() => navigateTo(activeIndex + 1)}
        >
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}

function App() {
  const mainRef = useRef(null)
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [textScale, setTextScale] = useState(readTextScalePreference)
  const shouldReduceMotion = useReducedMotion()
  const {
    navigateTo,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  } = useCinematicTransitions(
    mainRef,
    trackRef,
    activeIndex,
    setActiveIndex,
    shouldReduceMotion,
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(TEXT_SCALE_STORAGE_KEY, textScale)
    } catch (error) {
      console.warn('Não foi possível salvar a preferência de tamanho do texto.', error)
    }
  }, [textScale])

  return (
    <main
      className="experience-shell"
      data-text-scale={textScale}
      ref={mainRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Experiência Future Engineering"
    >
      <SiteHeader
        activeIndex={activeIndex}
        navigateTo={navigateTo}
        textScale={textScale}
        onTextScaleChange={setTextScale}
      />
      <div
        className="experience-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="experience-track" ref={trackRef}>
          <HomePanel active={activeIndex === 0} />
          <ServiceAreas activeIndex={activeIndex} />
          <ContactPanel
            active={activeIndex === servicePanels.length + 1}
            reducedMotion={shouldReduceMotion}
          />
        </div>
      </div>
      <NavigationControls activeIndex={activeIndex} navigateTo={navigateTo} />
    </main>
  )
}

export default App
