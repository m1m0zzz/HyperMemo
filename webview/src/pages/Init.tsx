import { useSetAtom } from "jotai"

import { modeAtom } from "../atoms/global"

export function Init() {
  const setMode = useSetAtom(modeAtom)
  return (
    <div>
      <h1>Init</h1>
      <div>
        <button
          onClick={() => setMode('sync')}
        >Sync</button>
        <button
          onClick={() => setMode('midi')}
        >Midi</button>
      </div>
    </div>
  )
}
