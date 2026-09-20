import * as React from "react"

// Μέτρο: the sidebar appears at 1024 and above, below that every route renders its phone layout.
const MOBILE_BREAKPOINT = 1024

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT
// On the server nothing is mobile; the sidebar's own classes hide it below the breakpoint.
const getServerSnapshot = () => false

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
