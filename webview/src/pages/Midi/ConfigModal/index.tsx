import { useCallback } from 'react'
import Modal from 'react-modal'
import { clamp } from '@tremolo-ui/functions'

import { TextAlign, useJuceContext } from '../../../providers/juce'

export function ConfigModal() {
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
      contentLabel='Display Settings'
    >
      <h2>Setting</h2>
      <section>
        <div>bg color:{' '}
          <input
            type='color'
            defaultValue={bgColor}
            onBlur={(e) => setBgColor(e.currentTarget.value)}
          />
        </div>
        <div>font color:{' '}
          <input
            type='color'
            defaultValue={fontColor}
            onBlur={(e) => setFontColor(e.currentTarget.value)}
          />
        </div>
        <div>font size:{' '}
          <input
            type='number'
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
            <option value='left'>left</option>
            <option value='center'>center</option>
            <option value='right'>right</option>
          </select>
        </div>
        <div>font: </div>
      </section>
    </Modal>
  )
}
