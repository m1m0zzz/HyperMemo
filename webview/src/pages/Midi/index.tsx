import { useCallback, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiSave, FiSettings } from 'react-icons/fi'
import { BlackKey, KeyLabel, Piano, WhiteKey } from '@tremolo-ui/react'
import { clamp, noteName, noteNumber } from '@tremolo-ui/functions'

import { getNativeFunction } from 'juce-framework-frontend-mirror'

import { IconButton } from '../../components/IconButton'

import styles from './styles.module.css'
import { useAtomValue, useSetAtom } from 'jotai'
import { bgColorAtom, fontColorAtom, fontSizeAtom, modalIsOpenAtom, textAlignAtom } from '../../atoms/midi'
import { ConfigModal } from './ConfigModal'

const MIN_NOTE_NUMBER = 0
const MAX_NOTE_NUMBER = 127

export function Midi() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)

  const [fullScreen, setFullScreen] = useState(false)
  const setIsOpen = useSetAtom(modalIsOpenAtom)
  const [editNoteNumber, setEditNoteNumber] = useState(noteNumber('C0'))
  const fontColor = useAtomValue(fontColorAtom)
  const bgColor = useAtomValue(bgColorAtom)
  const fontSize = useAtomValue(fontSizeAtom)
  const textAlign = useAtomValue(textAlignAtom)

  const openModal = useCallback(() => setIsOpen(true), [setIsOpen])

  const onMidiNoteOn = getNativeFunction('onMidiNoteOn')
  const onMidiNoteOff = getNativeFunction('onMidiNoteOff')

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
              <IconButton>
                <FiSave />
              </IconButton>
              <IconButton onClick={openModal}>
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
            <IconButton
              onClick={() => setFullScreen(!fullScreen)}
            >
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
                onMidiNoteOn(1, noteNumber)
              }}
              onStopNote={(noteNumber) => {
                onMidiNoteOff(1, noteNumber)
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
