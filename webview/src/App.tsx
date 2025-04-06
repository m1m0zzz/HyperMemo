import { useAtom } from "jotai"
import { useEffect } from "react"

import { Init } from "./pages/Init"
import { Sync } from "./pages/Sync"
import { Midi } from "./pages/Midi"

import { modeAtom } from "./atoms/global"

import "@tremolo-ui/react/styles/index.css"

function App() {
  const [mode, setMode] = useAtom(modeAtom)

  useEffect(() => {
    // set default mode
    setMode('midi')
  }, [])

  return (
    <>
      {mode == 'init' && <Init />}
      {mode == 'sync' && <Sync />}
      {mode == 'midi' && <Midi />}
    </>
  )
}

export default App
