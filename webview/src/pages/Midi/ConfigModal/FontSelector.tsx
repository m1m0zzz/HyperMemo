
import { useAsync } from "react-use"

import { useJuceContext } from "../../../providers/juce"
import { useEffect, useState } from "react"

import styles from './FontSelector.module.css'

function Option({ fontName }: { fontName: string }) {
  const state = useAsync(async () => {
    return await getFont(fontName)
  }, [fontName])

  return (
    state.loading
      ? <option value={fontName} disabled>Loading...</option>
      : state.error
        ? <option value={fontName} disabled>Not Exist: {fontName}</option>
        : <option
            value={fontName}
            style={{fontFamily: `${fontName}, system-ui`}}
          >{state.value}</option>
  )
}


async function getFont(fontName: string) {
  const googleApiUrl = `https://fonts.googleapis.com/css?family=${encodeURI(fontName)}`

  const response = await fetch(googleApiUrl)
  if (response.ok) {
    const cssFontFace = await response.text()
    const matchUrls = cssFontFace.match(/url\(.+?\)/g)
    if (!matchUrls) throw new Error("フォントが見つかりませんでした")

    for (const url of matchUrls) {
      const font = new FontFace(fontName, url)
      await font.load()
      document.fonts.add(font)
    }
    return fontName
  }
  throw new Error("フォントが見つかりませんでした")
}

const customFonts = [
  'system-ui',
  'Noto Sans JP',
  'Noto Serif JP',
  'Zen Maru Gothic',
  'DotGothic16',
  'Coral Pixels'
]


export function FontSelector() {
  const customId = 'Custom'

  const fontName = useJuceContext((s) => s.fontName)
  const setFontName = useJuceContext((s) => s.setFontName)
  const [customField, setCustomField] = useState(!customFonts.includes(fontName))
  const [error, setError] = useState(false)

  useEffect(() => {
    setCustomField(!customFonts.includes(fontName))
  }, [fontName])

  return (
    <div>
      <select
        defaultValue={customFonts.includes(fontName) ? fontName : customId}
        onChange={(e) => {
          const value = e.currentTarget.value
          if (value != customId) {
            setFontName(value)
          } else {
            setCustomField(true)
          }
        }}
        style={{fontFamily: fontName}}
      >
        {customFonts.map((font) =>
          font == 'system-ui' ?
            <option value='system-ui'>system-ui</option> :
            <Option key={font} fontName={font} />)}
        <option value={customId}>Custom</option>
      </select>
      {customField &&
        <input
          className={styles.customInput}
          defaultValue={customFonts.includes(fontName) ? '' : fontName}
          placeholder="Custom font name"
          onChange={async (e) => {
            const value = e.currentTarget.value
            try {
              await getFont(value)
              setError(false)
              setFontName(value)
            } catch {
              setError(true)
            }
          }}
        />
      }
      {error && <div className={styles.error}>A font that does not exist.</div>}
    </div>
  )
}
