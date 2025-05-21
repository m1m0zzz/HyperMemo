import { useRef } from 'react'
import { FiMaximize, FiMinimize } from 'react-icons/fi'
import { BlackKey, getNoteRangeArray, KeyLabel, Piano, useEventListener, WhiteKey } from '@tremolo-ui/react'
import { isWhiteKey, noteName } from '@tremolo-ui/functions'

import { IconButton } from '../../components/IconButton'
import { MAX_NOTE_NUMBER, MIN_NOTE_NUMBER, useJuceContext } from '../../providers/juce'

import { ConfigModal } from './ConfigModal'
import { Header } from './Header'

import styles from './styles.module.css'

export function Midi() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)

  const fullScreen = useJuceContext((s) => s.fullScreen)
  const setFullScreen = useJuceContext((s) => s.setFullScreen)
  const editNoteNumber = useJuceContext((s) => s.editNoteNumber)
  const setEditNoteNumber = useJuceContext((s) => s.setEditNoteNumber)
  const fontColor = useJuceContext((s) => s.fontColor)
  const bgColor = useJuceContext((s) => s.bgColor)
  const fontSize = useJuceContext((s) => s.fontSize)
  const fontName = useJuceContext((s) => s.fontName)
  const fontWeight = useJuceContext((s) => s.fontWeight)
  const textAlign = useJuceContext((s) => s.textAlign)
  const texts = useJuceContext((s) => s.texts)
  const setTextAt = useJuceContext((s) => s.setTextAt)

  const undo = useJuceContext((s) => s.undo)
  const redo = useJuceContext((s) => s.redo)

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen)
  }

  useEventListener(globalThis.window, 'keydown', (event) => {
    if (!event.ctrlKey) return
    if (event.key == 'z') {
      undo()
    } else if (event.key == 'y') {
      redo()
    }
  })

  return (
    <>
      <main className={styles.main}
        style={{ backgroundColor: bgColor }}
      >
        <Header />
        <div
          className={styles.content}
          style={{
            color: fontColor,
            fontSize: fontSize,
          }}
          data-full-screen='true'
        >
          <div className={styles.words}>
            <textarea
              value={texts[editNoteNumber] ?? ''}
              maxLength={600}
              style={{
                width: '100%',
                textAlign: textAlign,
                fontFamily: `${fontName}, system-ui`,
                fontWeight: fontWeight
              }}
              onChange={(e) => setTextAt(e.target.value, editNoteNumber)}
            />
          </div>
          <div className={styles.control}>
            <IconButton onClick={toggleFullScreen}>
              {fullScreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </div>
        </div>
        <div
          ref={pianoContainerRef}
          className={styles.pianoContainer}
          data-full-screen={fullScreen}
        >
          <Piano
            noteRange={{first: MIN_NOTE_NUMBER, last: MAX_NOTE_NUMBER}}
            className={styles.piano}
            height={120}
            onPlayNote={(note) => {
              // TODO: Only works with release builds.
              console.log('play note')
              setEditNoteNumber(note)
            }}
          >
            {getNoteRangeArray({first: MIN_NOTE_NUMBER, last: MAX_NOTE_NUMBER}).map((note) =>
              isWhiteKey(note) ? (
                <WhiteKey
                  key={note}
                  noteNumber={note}
                  className={styles.whiteKey}
                  data-has-text={(texts[note]?.length ?? 0) > 0}
                  onPointerDown={() => setEditNoteNumber(note)}
                >
                  <KeyLabel
                    label={(note) => {
                      const name = noteName(note)
                      return name.startsWith('C') ? name : null
                    }}
                    style={{ border: 'none' }}
                  />
                </WhiteKey>
              ) : (
                <BlackKey
                  key={note}
                  noteNumber={note}
                  className={styles.blackKey}
                  data-has-text={(texts[note]?.length ?? 0) > 0}
                  onPointerDown={() => setEditNoteNumber(note)}
                />
              )
            )}
          </Piano>
        </div>
      </main>
      <ConfigModal />
    </>
  )
}
