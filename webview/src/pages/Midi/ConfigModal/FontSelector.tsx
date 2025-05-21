
import { ComponentPropsWithoutRef, useRef, useState } from "react"
import { useAsync } from "react-use"
import { FiEdit } from "react-icons/fi"

import { IconButton } from "../../../components/IconButton"
import { useJuceContext } from "../../../providers/juce"

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


export function FontSelector({...props}: ComponentPropsWithoutRef<'div'>) {
  const customInputRef = useRef<HTMLInputElement>(null)
  const fontName = useJuceContext((s) => s.fontName)
  const setFontName = useJuceContext((s) => s.setFontName)
  const [customField, setCustomField] = useState(!customFonts.includes(fontName))
  const [error, setError] = useState(false)

  return (
    <div
      {...props}
    >
      <div className={styles.flex}>
        {!customField ?
          <select
            title='font name'
            defaultValue={fontName}
            onChange={(e) => {
              const value = e.currentTarget.value
              setFontName(value)
            }}
            style={{ fontFamily: fontName }}
          >
            {customFonts.map((font) =>
              font == 'system-ui' ?
                <option key='system-ui' value='system-ui'>system-ui</option> :
                <Option key={font} fontName={font} />)}
          </select> :
          <input
            ref={customInputRef}
            title='font name'
            className={styles.customInput}
            defaultValue={customFonts.includes(fontName) ? '' : fontName}
            placeholder="Custom font name (from Google Fonts)"
            onChange={async (e) => {
              const value = e.currentTarget.value
              try {
                const result = await getFont(value)
                if (result) {
                  setError(false)
                  setFontName(value)
                }
              } catch {
                setError(true)
              }
            }}
          />
        }
        <IconButton
          onClick={() => {
            if (!customField) {
              setTimeout(() => customInputRef.current?.focus(), 100)
            }
            setCustomField(!customField)
            setError(false)
          }}
          title={customField ? 'Select a font' : 'Enter a custom font'}
          style={{
            ...{
              width: 32,
              height: 32
            },
            ...(customField && {
              borderRadius: 16,
              backgroundColor: 'var(--c-active)'
            })
          }}
        >
          <FiEdit />
        </IconButton>
      </div>
      {error && <div className={styles.error}>Font does not exist on Google Fonts.</div>}
    </div>
  )
}
