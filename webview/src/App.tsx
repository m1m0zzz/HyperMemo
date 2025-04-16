import { Init } from "./pages/Init"
import { Sync } from "./pages/Sync"
import { Midi } from "./pages/Midi"

import { JuceProvider, useJuceContext } from "./providers/juce"

import "@tremolo-ui/react/styles/index.css"

function App() {
  return (
    <JuceProvider>
      <SimpleRouter />
    </JuceProvider>
  )
}

function SimpleRouter () {
  const mode = useJuceContext(s => s.mode)

  return (
    <>
      {mode == 'init' && <Init />}
      {mode == 'sync' && <Sync />}
      {mode == 'midi' && <Midi />}
    </>
  )
}

export default App
