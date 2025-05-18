import { useCallback, useMemo, useRef } from 'react'
import { BiRedo, BiUndo } from 'react-icons/bi'
import { FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize, FiSave, FiSettings } from 'react-icons/fi'
import { BlackKey, getNoteRangeArray, KeyLabel, Piano, useEventListener, WhiteKey } from '@tremolo-ui/react'
import { clamp, isWhiteKey, noteName } from '@tremolo-ui/functions'

import { IconButton } from '../../components/IconButton'
import { useJuceContext } from '../../providers/juce'

import { ConfigModal } from './ConfigModal'

import styles from './styles.module.css'

const MIN_NOTE_NUMBER = 0
const MAX_NOTE_NUMBER = 127

export function Midi() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)
  const saveAnchorRef = useRef<HTMLAnchorElement>(null)

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
  const canUndo = useJuceContext((s) => s.canUndo)
  const canRedo = useJuceContext((s) => s.canRedo)

  const setModalIsOpen = useJuceContext(s => s.setModalIsOpen)

  const openModal = useCallback(() => setModalIsOpen(true), [setModalIsOpen])

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

  function getDateString() {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\/|\s|:/g, '-')
  }

  const encodedTexts = useMemo(() => `data:text/plain,${encodeURIComponent(
    texts.map(t => t.replaceAll('\n', '<br />')).join('\n').replace(/\n*$/, '')
  )}`, [texts])

  return (
    <>
      <main className={styles.main}
        style={{ backgroundColor: bgColor }}
      >
        <nav className={styles.header} data-full-screen={fullScreen}>
          <div className={styles.title}>Trigger Memo</div>
          <div className={styles.noteControl}>
            <IconButton onClick={() => setEditNoteNumber(clamp(editNoteNumber - 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}>
              <FiChevronLeft size={'1rem'} />
            </IconButton>
            <span className={styles.currentNote}>{noteName(editNoteNumber)}</span>
            <IconButton onClick={() => setEditNoteNumber(clamp(editNoteNumber + 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}>
              <FiChevronRight size={'1rem'}/>
            </IconButton>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerRightGroup}>
              <IconButton
                title='Undo'
                disabled={!canUndo}
                onClick={() => undo()}
              >
                <BiUndo />
              </IconButton>
              <IconButton
                title='Redo'
                disabled={!canRedo}
                onClick={() => redo()}
              >
                <BiRedo />
              </IconButton>
            </div>
            <div className={styles.headerRightGroup}>
              <IconButton title='Save' onClick={() => saveAnchorRef.current?.click()}>
                <FiSave />
                <a
                  ref={saveAnchorRef}
                  style={{display: 'none'}}
                  href={encodedTexts}
                  download={`${getDateString()}.txt`}
                ></a>
              </IconButton>
              <IconButton title='Open settings' onClick={openModal}>
                <FiSettings />
              </IconButton>
            </div>
          </div>
        </nav>
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
              // TODO: is not working
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
