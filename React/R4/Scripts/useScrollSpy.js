import { useState, useEffect } from 'react'

export default function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!ids || ids.length === 0) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el) => el !== null)

    if (elements.length === 0) return

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

          if (visibleEntries.length > 0) {
            setActiveId(visibleEntries[0].target.id)
          }
        },
        {
          threshold: [0.3, 0.4, 0.5, 0.6],
        }
      )

      elements.forEach((element) => observer.observe(element))

      return () => {
        elements.forEach((element) => observer.unobserve(element))
        observer.disconnect()
      }
    } else {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight / 3

        let currentActive = null

        for (let i = elements.length - 1; i >= 0; i--) {
          const element = elements[i]
          if (element.offsetTop <= scrollPosition) {
            currentActive = element.id
            break
          }
        }

        if (currentActive === null && elements.length > 0) {
          currentActive = elements[0].id
        }

        setActiveId(currentActive)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()

      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [ids])

  return activeId
}
