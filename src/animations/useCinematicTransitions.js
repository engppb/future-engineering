import { useCallback, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneMotion } from './sceneMotion'

gsap.registerPlugin(ScrollTrigger)

const PANEL_COUNT = 6
const DRAG_THRESHOLD = 48
const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [contenteditable="true"], [data-no-panel-drag]'

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR))
}

export function useCinematicTransitions(
  rootRef,
  trackRef,
  activeIndex,
  setActiveIndex,
  reducedMotion,
) {
  const activeIndexRef = useRef(activeIndex)
  const dragRef = useRef(null)
  const isDraggingRef = useRef(false)

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const navigateTo = useCallback(
    (requestedIndex) => {
      const root = rootRef.current
      const track = trackRef.current
      if (!root || !track) return

      const nextIndex = gsap.utils.clamp(0, PANEL_COUNT - 1, requestedIndex)
      const previousIndex = activeIndexRef.current
      if (nextIndex === previousIndex && !isDraggingRef.current) return

      activeIndexRef.current = nextIndex
      isDraggingRef.current = false
      setActiveIndex(nextIndex)

      const destination = -nextIndex * root.clientWidth
      const progress = () => {
        const currentX = Number(gsap.getProperty(track, 'x')) || 0
        const viewportWidth = root.clientWidth
        const normalized = gsap.utils.clamp(
          0,
          1,
          -currentX / (viewportWidth * (PANEL_COUNT - 1)),
        )
        sceneMotion.scrollProgress = normalized
        sceneMotion.environmentProgress = normalized
        root.style.setProperty('--environment-progress', normalized.toFixed(3))
      }

      gsap.killTweensOf(track)
      if (reducedMotion) {
        gsap.set(track, { x: destination })
        progress()
        return
      }

      const panels = track.querySelectorAll('.experience-panel')
      const targetPanel = panels[nextIndex]
      const currentPanel = panels[previousIndex]
      const targetVisual = targetPanel?.querySelector(
        '.service-visual, .scene-panel, .contact-diagram',
      )
      const targetCopy = targetPanel?.querySelectorAll(
        '.panel-kicker, h1, h2, .hero-description, .service-description, .service-button, .service-detail, .primary-cta, .contact-signature',
      )
      const direction = nextIndex > previousIndex ? 1 : -1
      gsap.set(panels, {
        clearProps: 'transform,opacity,visibility',
      })
      if (targetPanel) {
        gsap.set(targetPanel, {
          transformPerspective: 1400,
          transformOrigin: direction > 0 ? 'left center' : 'right center',
        })
      }
      if (currentPanel) {
        gsap.set(currentPanel, {
          transformPerspective: 1400,
          transformOrigin: direction > 0 ? 'right center' : 'left center',
        })
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'expo.inOut' },
        onUpdate: progress,
        onComplete: () => {
          progress()
          gsap.set(panels, { clearProps: 'transform,opacity,visibility' })
        },
      })

      timeline.to(track, { x: destination, duration: 1.48 }, 0)
      if (currentPanel) {
        timeline.to(
          currentPanel,
          {
            rotateY: -direction * 6,
            z: -110,
            scale: 0.965,
            autoAlpha: 0.6,
            duration: 1.32,
            ease: 'power3.in',
          },
          0,
        )
      }
      if (targetPanel) {
        timeline.fromTo(
          targetPanel,
          {
            rotateY: direction * 9,
            z: -150,
            scale: 0.94,
            autoAlpha: 0.62,
          },
          {
            rotateY: 0,
            z: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 1.48,
            ease: 'power4.out',
          },
          0,
        )
      }
      if (targetVisual) {
        timeline.fromTo(
          targetVisual,
          {
            x: 48 * direction,
            y: 12,
            z: 85,
            rotateY: -direction * 5,
            scale: 0.91,
            autoAlpha: 0.3,
          },
          {
            x: 0,
            y: 0,
            z: 0,
            rotateY: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 1.24,
            ease: 'power4.out',
          },
          0.08,
        )
      }
      const currentVisual = currentPanel?.querySelector(
        '.service-visual, .scene-panel, .contact-diagram',
      )
      const targetAtmosphere = targetPanel?.querySelector('.panel-atmosphere')
      const currentAtmosphere = currentPanel?.querySelector('.panel-atmosphere')
      if (currentVisual) {
        timeline.to(
          currentVisual,
          {
            x: -direction * 24,
            z: -45,
            scale: 0.98,
            autoAlpha: 0.74,
            duration: 1.05,
            ease: 'power3.in',
          },
          0,
        )
      }
      if (targetAtmosphere) {
        timeline.fromTo(
          targetAtmosphere,
          { x: 110 * direction, scale: 1.12, opacity: 0.35 },
          {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 1.55,
            ease: 'power3.out',
          },
          0,
        )
      }
      if (currentAtmosphere) {
        timeline.to(
          currentAtmosphere,
          {
            x: -72 * direction,
            scale: 0.92,
            opacity: 0.55,
            duration: 1.38,
            ease: 'power3.in',
          },
          0,
        )
      }
      if (targetCopy?.length) {
        timeline.fromTo(
          targetCopy,
          { x: 28 * direction, y: 10, z: 28, autoAlpha: 0 },
          {
            x: 0,
            y: 0,
            z: 0,
            autoAlpha: 1,
            duration: 0.78,
            stagger: 0.09,
            ease: 'power4.out',
          },
          0.28,
        )
      }
    },
    [reducedMotion, rootRef, setActiveIndex, trackRef],
  )

  const handlePointerDown = useCallback((event) => {
    if (
      event.button !== 0 ||
      isInteractiveTarget(event.target)
    ) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      deltaX: 0,
      isHorizontal: false,
    }
  }, [])

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current
      const track = trackRef.current
      const root = rootRef.current
      if (!drag || !track || !root || drag.pointerId !== event.pointerId) return

      const deltaX = event.clientX - drag.startX
      const deltaY = event.clientY - drag.startY
      if (!drag.isHorizontal) {
        if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
          dragRef.current = null
          return
        }
        if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return

        drag.isHorizontal = true
        isDraggingRef.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        gsap.killTweensOf(track)
      }

      event.preventDefault()
      drag.deltaX = deltaX
      const width = root.clientWidth
      const currentX = -activeIndexRef.current * width
      const nextX = gsap.utils.clamp(
        -((PANEL_COUNT - 1) * width),
        0,
        currentX + deltaX,
      )
      gsap.set(track, { x: nextX })
      sceneMotion.scrollProgress = gsap.utils.clamp(
        0,
        1,
        -nextX / (width * (PANEL_COUNT - 1)),
      )
      root.style.setProperty(
        '--environment-progress',
        sceneMotion.scrollProgress.toFixed(3),
      )
    },
    [rootRef, trackRef],
  )

  const handlePointerUp = useCallback(
    (event) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return

      dragRef.current = null
      if (!drag.isHorizontal) return

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      const currentIndex = activeIndexRef.current
      if (Math.abs(drag.deltaX) >= DRAG_THRESHOLD) {
        navigateTo(currentIndex + (drag.deltaX < 0 ? 1 : -1))
      } else {
        navigateTo(currentIndex)
      }
    },
    [navigateTo],
  )

  const handleKeyDown = useCallback(
    (event) => {
      const target = event.target
      const isNavigationControl =
        target instanceof Element &&
        Boolean(target.closest('.panel-menu, .navigation-controls'))
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (isInteractiveTarget(target) && !isNavigationControl)
      ) {
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        navigateTo(activeIndexRef.current + (event.key === 'ArrowRight' ? 1 : -1))
      }
    },
    [navigateTo],
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return undefined

    const syncTrackToViewport = () => {
      gsap.killTweensOf(track)
      gsap.set(track, { x: -activeIndexRef.current * root.clientWidth })
      ScrollTrigger.refresh()
    }
    const resizeObserver = new ResizeObserver(syncTrackToViewport)
    resizeObserver.observe(root)
    gsap.set(track, { x: -activeIndexRef.current * root.clientWidth })

    const detailTriggers = []
    root.querySelectorAll('.panel-copy-scroll').forEach((scroller) => {
      const detail = scroller.querySelector('.service-detail')
      if (!detail) return

      detailTriggers.push(
        ScrollTrigger.create({
          trigger: detail,
          scroller,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            if (reducedMotion) return
            gsap.fromTo(
              detail,
              { y: 12, autoAlpha: 0.65 },
              { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' },
            )
          },
        }),
      )
    })

    if (!reducedMotion) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .fromTo(
          '.site-header',
          { autoAlpha: 0, y: -14 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
        )
        .fromTo(
          '.scene-panel',
          { autoAlpha: 0, x: 34, clipPath: 'inset(5% 0 5% 10%)' },
          {
            autoAlpha: 1,
            x: 0,
            clipPath: 'inset(0% 0 0% 0%)',
            duration: 1.05,
          },
          '-=0.35',
        )
    }

    ScrollTrigger.refresh()
    return () => {
      resizeObserver.disconnect()
      detailTriggers.forEach((trigger) => trigger.kill())
      gsap.killTweensOf(track)
      sceneMotion.scrollProgress = 0
      sceneMotion.environmentProgress = 0
      root.style.setProperty('--environment-progress', '0')
    }
  }, [reducedMotion, rootRef, trackRef])

  return {
    navigateTo,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  }
}
