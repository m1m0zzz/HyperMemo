import { useCallback, useState } from "react"
import { FiMaximize, FiMinimize, FiSave, FiSettings } from "react-icons/fi"
import { BlackKey, Piano, WhiteKey } from "@tremolo-ui/react"
import { clamp, noteName } from "@tremolo-ui/functions"

import Modal from 'react-modal'

import { IconButton } from "../../components/IconButton"

import styles from './styles.module.css'

export function Midi() {
  const [fullScreen, setFullScreen] = useState(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [fontColor, setFontColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(32)
  type TextAlign = 'left' | 'center' | 'right'
  const [textAlign, setTextAlign] = useState<TextAlign>('center')

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <main className={styles.main}>
        {!fullScreen &&
          <nav className={styles.header}>
            <div className={styles.title}>Trigger Memo</div>
            <div className={styles.headerRight}>
              <IconButton onClick={openModal}>
                <FiSettings />
              </IconButton>
              <IconButton>
                <FiSave />
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
        >
          {!fullScreen &&
            <div
              className={styles.noteName}
              style={{
                color: `color-mix(in srgb, ${fontColor} 80%, transparent)`
              }}
            >
              C3
            </div>
          }
          <div className={styles.words}>
            <textarea
              style={{
                textAlign: textAlign
              }}
            >サンプルテキスト
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
            className={styles.pianoContainer}
            style={{
              backgroundColor: bgColor
            }}
          >
            <Piano
              noteRange={{first: 0, last: 127}}
              label={(note) => noteName(note)}
              className={styles.piano}
            >
              <WhiteKey onClick={() => console.log('a')} />
              <BlackKey />
            </Piano>
          </div>
        }
      </main>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 100,
          }
        }}
        contentLabel="Display Settings"
      >
        <h2>Setting</h2>
        <section>
          <div>bg color:{' '}
            <input
              type="color"
              defaultValue={bgColor}
              onBlur={(e) => setBgColor(e.currentTarget.value)}
            />
          </div>
          <div>font color:{' '}
            <input
              type="color"
              defaultValue={fontColor}
              onBlur={(e) => setFontColor(e.currentTarget.value)}
            />
          </div>
          <div>font size:{' '}
            <input
              type="number"
              defaultValue={fontSize}
              min={8}
              max={200}
              onChange={(e) => setFontSize(clamp(Number(e.currentTarget.value), 8, 200))}
            />
          </div>
          <div>text align:{' '}
            <select
              value={textAlign}
              onChange={(e) => setTextAlign(e.currentTarget.value as TextAlign)}
            >
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
          </div>
          <div>font: </div>
        </section>
      </Modal>
    </>
  )
}
