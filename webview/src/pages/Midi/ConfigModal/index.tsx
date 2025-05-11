import { useCallback, useRef } from 'react'
import Modal from 'react-modal'
import { DecrementStepper, IncrementStepper, NumberInput, Stepper } from '@tremolo-ui/react'
import { clamp } from '@tremolo-ui/functions'

import { InputColor } from '../../../components/InputColor'
import { TextAlign, useJuceContext } from '../../../providers/juce'

import { FontSelector } from './fontSelector'

import styles from './styles.module.css'

Modal.setAppElement("#root")

export function ConfigModal() {
  const containerRef = useRef<HTMLDivElement>(null)

  const modalIsOpen = useJuceContext(s => s.modalIsOpen)
  const setModalIsOpen = useJuceContext(s => s.setModalIsOpen)
  const bgColor = useJuceContext((s) => s.bgColor)
  const setBgColor = useJuceContext((s) => s.setBgColor)
  const fontColor = useJuceContext((s) => s.fontColor)
  const setFontColor = useJuceContext((s) => s.setFontColor)
  const fontSize = useJuceContext((s) => s.fontSize)
  const setFontSize = useJuceContext((s) => s.setFontSize)
  const textAlign = useJuceContext((s) => s.textAlign)
  const setTextAlign = useJuceContext((s) => s.setTextAlign)

  const closeModal = useCallback(() => setModalIsOpen(false), [setModalIsOpen])

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
      contentLabel='Display Settings'
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          minWidth: 500,
          minHeight: 'max(50vh, 440px)',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          padding: 0
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 10,
        }
      }}
    >
      <div className={styles.container} ref={containerRef}>
        <div className={styles.heading}>Setting</div>
        <section className={styles.settings}>
          <div>
            <div className={styles.label}>background color</div>
            <InputColor
              value={bgColor}
              onBlur={setBgColor}
              rootElement={containerRef}
            />
          </div>
          <div>
            <div className={styles.label}>font color</div>
            <InputColor
              value={fontColor}
              onBlur={setFontColor}
              rootElement={containerRef}
            />
          </div>
          <div>
            <div className={styles.label}>font size</div>
            <NumberInput
              // variant='filled'
              value={fontSize}
              min={8}
              max={200}
              onChange={(value) => setFontSize(clamp(value, 8, 200))}
            >
              <Stepper>
                <IncrementStepper />
                <DecrementStepper />
              </Stepper>
            </NumberInput>
          </div>
          <div>
            <div className={styles.label}>text align</div>
            <select
              value={textAlign}
              onChange={(e) => setTextAlign(e.currentTarget.value as TextAlign)}
            >
              <option value='left'>left</option>
              <option value='center'>center</option>
              <option value='right'>right</option>
            </select>
          </div>
          <div>
            <div className={styles.label}>font</div>
            <FontSelector />
          </div>
        </section>
      </div>
    </Modal>
  )
}
