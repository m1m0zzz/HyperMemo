import { Init } from "./pages/Init"
import { Sync } from "./pages/Sync"
import { Midi } from "./pages/Midi"

import { JuceProvider, useJuceContext } from "./providers/juce"
import { useMemo } from "react"

function App() {
  return (
    <JuceProvider>
      <SimpleRouter />
    </JuceProvider>
  )
}

function SimpleRouter () {
  const mode = useJuceContext(s => s.mode)

  const result = useMemo(() => {
    if (mode == 'init') {
      return <Init />
    } else if (mode == 'sync') {
      return <Sync />
    } else if (mode == 'midi') {
      return <Midi />
    } else {
      return <div>Router Error!</div>
    }
  }, [mode])

  return result
}

export default App
