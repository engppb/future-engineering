import { useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCinematicTransitions } from './animations/useCinematicTransitions'
import SceneExperience from './components/SceneExperience'
import ServiceAreas from './components/ServiceAreas'
import './App.css'

const inquiryLink =
  'mailto:?subject=Solicita%C3%A7%C3%A3o%20de%20consultoria%20em%20engenharia'

function BrandMark() {
  return (
    <a className="brand" href="#inicio" aria-label="PA Engineering, início">
      <span className="brand-symbol" aria-hidden="true">
        <span>PA</span>
        <span className="brand-divider" />
      </span>
      <span className="brand-name">ENGINEERING</span>
    </a>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <BrandMark />
      <a className="header-link" href="#solicitar-consultoria">
        <span>CONSULTORIA EM ENGENHARIA</span>
        <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
      </a>
    </header>
  )
}

function HeroContent() {
  const shouldReduceMotion = useReducedMotion()
  const enterFromLeft = shouldReduceMotion
    ? false
    : { opacity: 0, x: -18 }
  const enterFromBelow = shouldReduceMotion
    ? false
    : { opacity: 0, y: 14 }
  const enterTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  const titleVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : 0.08,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  }
  const titleLineVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: enterTransition,
    },
  }

  return (
    <div className="hero-copy">
      <motion.p
        className="eyebrow"
        initial={enterFromLeft}
        animate={{ opacity: 1, x: 0 }}
        transition={enterTransition}
      >
        <span className="eyebrow-line" aria-hidden="true" />
        CONSULTORIA · OPERAÇÕES · CONFIABILIDADE
      </motion.p>

      <motion.h1
        initial={shouldReduceMotion ? false : 'hidden'}
        animate="visible"
        variants={titleVariants}
      >
        <motion.span className="hero-title-line" variants={titleLineVariants}>
          ENGENHARIA QUE
        </motion.span>
        <motion.span className="hero-title-line" variants={titleLineVariants}>
          TRANSFORMA
        </motion.span>
        <motion.span className="hero-title-line" variants={titleLineVariants}>
          COMPLEXIDADE EM
        </motion.span>
        <motion.span
          className="hero-title-line hero-title-accent"
          variants={titleLineVariants}
        >
          PRECISÃO.
        </motion.span>
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
        id="solicitar-consultoria"
        href={inquiryLink}
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
  )
}

function ScenePanel() {
  return (
    <div className="scene-panel" aria-label="Visualização de componentes mecânicos">
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-topline" aria-hidden="true">
        <span>SISTEMA DE TRANSMISSÃO</span>
        <span>FIG. 01 — CONJUNTO MECÂNICO</span>
      </div>
      <div className="scene-visual">
        <SceneExperience />
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

function HeroSection() {
  const mainRef = useRef(null)
  useCinematicTransitions(mainRef)

  return (
    <main ref={mainRef}>
      <section className="hero-section" id="inicio">
        <SiteHeader />
        <div className="hero-layout">
          <HeroContent />
          <ScenePanel />
        </div>
        <div className="hero-bottom">
          <span className="hero-index">
            <span>01</span> / 01
          </span>
          <span className="hero-bottom-label">
            SOLUÇÕES TÉCNICAS PARA DESAFIOS REAIS
          </span>
          <a className="scroll-cue" href="#especialidades">
            <span>DESCUBRA NOSSA ABORDAGEM</span>
            <ArrowDown size={14} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </section>
      <ServiceAreas />
    </main>
  )
}

function App() {
  return <HeroSection />
}

export default App
