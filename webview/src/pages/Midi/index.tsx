import { useCallback, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiSave, FiSettings } from 'react-icons/fi'
import { BlackKey, KeyLabel, Piano, WhiteKey } from '@tremolo-ui/react'
import { clamp, noteName } from '@tremolo-ui/functions'

import { IconButton } from '../../components/IconButton'
import { useJuceContext } from '../../providers/juce'

import { ConfigModal } from './ConfigModal'

import styles from './styles.module.css'

const MIN_NOTE_NUMBER = 0
const MAX_NOTE_NUMBER = 127

export function Midi() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)

  const fullScreen = useJuceContext((s) => s.fullScreen)
  const setFullScreen = useJuceContext((s) => s.setFullScreen)
  const editNoteNumber = useJuceContext((s) => s.editNoteNumber)
  const setEditNoteNumber = useJuceContext((s) => s.setEditNoteNumber)
  const fontColor = useJuceContext((s) => s.fontColor)
  const bgColor = useJuceContext((s) => s.bgColor)
  const fontSize = useJuceContext((s) => s.fontSize)
  const textAlign = useJuceContext((s) => s.textAlign)

  const setModalIsOpen = useJuceContext(s => s.setModalIsOpen)

  const openModal = useCallback(() => setModalIsOpen(true), [setModalIsOpen])

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen)
  }

  return (
    <>
      <main className={styles.main}>
        {!fullScreen &&
          <nav className={styles.header}>
            <div className={styles.title}>Trigger Memo</div>
            <div className={styles.noteControl}>
              <IconButton onClick={() => setEditNoteNumber(clamp(editNoteNumber - 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}>
                <FiChevronLeft size={'1rem'} />
              </IconButton>
              <span className={styles.currentNote}>{noteName(editNoteNumber)}</span>
              <IconButton onClick={() => setEditNoteNumber(clamp(editNoteNumber + 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}>
                <FiChevronRight size={'1rem'} />
              </IconButton>
            </div>
            <div className={styles.headerRight}>
              <IconButton title='Save'>
                <FiSave />
              </IconButton>
              <IconButton title='Open settings' onClick={openModal}>
                <FiSettings />
              </IconButton>
            </div>
          </nav>
        }
        <div
          className={styles.content}
          style={{
            backgroundColor: bgColor,
            color: fontColor,
            fontSize: fontSize,
          }}
          data-full-screen={fullScreen}
        >
          <div className={styles.words}>
            <textarea
              defaultValue={'サンプルテキスト'}
              style={{
                width: '100%',
                textAlign: textAlign
              }}
            >
            </textarea>
          </div>
          <div className={styles.control}>
            <IconButton onClick={toggleFullScreen}>
              {fullScreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </div>
        </div>
        {fullScreen ||
          <div
            ref={pianoContainerRef}
            className={styles.pianoContainer}
            style={{
              backgroundColor: bgColor
            }}
          >
            <Piano
              noteRange={{first: MIN_NOTE_NUMBER, last: MAX_NOTE_NUMBER}}
              className={styles.piano}
              height={120}
              onPlayNote={(noteNumber) => {
                setEditNoteNumber(noteNumber)
                // onMidiNoteOn(1, noteNumber)
              }}
              onStopNote={() => {
                // onMidiNoteOff(1, noteNumber)
              }}
            >
              <WhiteKey>
                <KeyLabel
                  label={(noteNumber) => {
                    const name = noteName(noteNumber)
                    return name.startsWith('C') ? name : null
                  }}
                  style={{
                    border: 'none'
                  }}
                />
              </WhiteKey>
              <BlackKey />
            </Piano>
          </div>
        }
      </main>
      <ConfigModal />
    </>
  )
}
