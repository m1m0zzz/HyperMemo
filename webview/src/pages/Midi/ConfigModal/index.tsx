import { useAtom } from 'jotai'
import { useCallback } from 'react'
import Modal from 'react-modal'
import { clamp } from '@tremolo-ui/functions'

import { bgColorAtom, fontColorAtom, fontSizeAtom, modalIsOpenAtom, TextAlign, textAlignAtom } from '../../../atoms/midi'

export function ConfigModal() {
  const [modalIsOpen, setIsOpen] = useAtom(modalIsOpenAtom)

  const [fontColor, setFontColor] = useAtom(fontColorAtom)
  const [bgColor, setBgColor] = useAtom(bgColorAtom)
  const [fontSize, setFontSize] = useAtom(fontSizeAtom)
  const [textAlign, setTextAlign] = useAtom(textAlignAtom)

  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen])

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
