import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneMotion } from './sceneMotion'

gsap.registerPlugin(ScrollTrigger)

export function useCinematicTransitions(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) {
      sceneMotion.scrollProgress = 0
      sceneMotion.environmentProgress = 0
      return undefined
    }

    const media = gsap.matchMedia(root)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const intro = gsap.timeline({
          defaults: { ease: 'power3.out' },
        })

        intro
          .fromTo(
            '.site-header',
            { autoAlpha: 0, y: -16 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
          )
          .fromTo(
            '.scene-panel',
            { autoAlpha: 0, x: 34, clipPath: 'inset(5% 0 5% 10%)' },
            {
              autoAlpha: 1,
              x: 0,
              clipPath: 'inset(0% 0 0% 0%)',
              duration: 1.15,
            },
            '-=0.45',
          )
          .fromTo(
            '.scene-topline, .scene-readout, .scene-crosshair',
            { autoAlpha: 0, y: 8 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.48,
              stagger: 0.08,
            },
            '-=0.55',
          )
          .fromTo(
            '.hero-bottom',
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            '-=0.25',
          )

        ScrollTrigger.create({
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          onUpdate: ({ progress }) => {
            sceneMotion.scrollProgress = progress
          },
          onRefresh: ({ progress }) => {
            sceneMotion.scrollProgress = progress
          },
        })

        gsap.fromTo(
          '.approach-intro',
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.approach-intro',
              start: 'top 78%',
              once: true,
            },
          },
        )

        gsap.utils.toArray('.service-panel').forEach((panel, index) => {
          const visual = panel.querySelector('.service-visual')
          const copy = panel.querySelector('.service-panel-copy')

          gsap
            .timeline({
              scrollTrigger: {
                trigger: panel,
                start: 'top 76%',
                once: true,
              },
            })
            .fromTo(
              visual,
              {
                autoAlpha: 0,
                x: index % 2 === 0 ? -32 : 32,
                clipPath: 'inset(5% 0 5% 0%)',
              },
              {
                autoAlpha: 1,
                x: 0,
                clipPath: 'inset(0% 0 0% 0%)',
                duration: 0.9,
                ease: 'power3.out',
              },
            )
            .fromTo(
              copy,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.72,
                ease: 'power2.out',
              },
              '-=0.56',
            )

          gsap.to(panel.querySelector('.service-visual-art'), {
            yPercent: index % 2 === 0 ? -5 : 5,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          })
        })

        ScrollTrigger.create({
          trigger: '.approach-section',
          start: 'top 88%',
          end: 'top 30%',
          scrub: 0.7,
          onUpdate: ({ progress }) => {
            sceneMotion.environmentProgress = progress
            root.style.setProperty(
              '--environment-progress',
              progress.toFixed(3),
            )
          },
          onRefresh: ({ progress }) => {
            sceneMotion.environmentProgress = progress
            root.style.setProperty(
              '--environment-progress',
              progress.toFixed(3),
            )
          },
        })
      }, root)

      return () => {
        context.revert()
        sceneMotion.scrollProgress = 0
        sceneMotion.environmentProgress = 0
        root.style.setProperty('--environment-progress', '0')
      }
    })

    return () => media.revert()
  }, [rootRef])
}
