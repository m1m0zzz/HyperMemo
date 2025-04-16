import { useJuceContext } from "../providers/juce"

export function Init() {
  const setMode = useJuceContext(s => s.setMode)

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
