import { useRef, useCallback, useMemo } from "react"
import { BiUndo, BiRedo } from "react-icons/bi"
import { FiChevronLeft, FiChevronRight, FiSave, FiSettings } from "react-icons/fi"
import { clamp, noteName } from '@tremolo-ui/functions'

import { IconButton } from "../../../components/IconButton"
import { JuceLink } from "../../../components/JuceLink"
import { MAX_NOTE_NUMBER, MIN_NOTE_NUMBER, useJuceContext } from "../../../providers/juce"

import styles from './Header.module.css'

export function Header() {
    const saveAnchorRef = useRef<HTMLAnchorElement>(null)

    const fullScreen = useJuceContext((s) => s.fullScreen)
    const editNoteNumber = useJuceContext((s) => s.editNoteNumber)
    const setEditNoteNumber = useJuceContext((s) => s.setEditNoteNumber)
    const texts = useJuceContext((s) => s.texts)
    
    const undo = useJuceContext((s) => s.undo)
    const redo = useJuceContext((s) => s.redo)
    const canUndo = useJuceContext((s) => s.canUndo)
    const canRedo = useJuceContext((s) => s.canRedo)

    const setModalIsOpen = useJuceContext(s => s.setModalIsOpen)
    const openModal = useCallback(() => setModalIsOpen(true), [setModalIsOpen])

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
    <nav className={styles.header} data-full-screen={fullScreen}>
      <div className={styles.title}>
        <JuceLink href="https://m1m0zzz.github.io">
          <span className={styles.titlePrimary}>HyperMemo</span>
        </JuceLink>
        <span className={styles.titleSecondary}>(MIDI mode)</span>
      </div>
      <div className={styles.noteControl}>
        <IconButton
          disabled={editNoteNumber <= MIN_NOTE_NUMBER}
          onClick={() => setEditNoteNumber(clamp(editNoteNumber - 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}
        >
          <FiChevronLeft size={'1rem'} />
        </IconButton>
        <span className={styles.currentNote}>{noteName(editNoteNumber)}</span>
        <IconButton
          disabled={editNoteNumber >= MAX_NOTE_NUMBER}
          onClick={() => setEditNoteNumber(clamp(editNoteNumber + 1, MIN_NOTE_NUMBER, MAX_NOTE_NUMBER))}
        >
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
  )
}
