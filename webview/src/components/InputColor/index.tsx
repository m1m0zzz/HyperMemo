import { RefObject, useEffect, useState } from 'react'
import { ChromePicker } from 'react-color'

import styles from './InputColor.module.css'

interface Props {
  value: string
  onBlur?: (value: string) => void
  rootElement?: RefObject<HTMLElement | null>
}

export function InputColor({
  value,
  onBlur,
  rootElement,
}: Props) {
  const [displayPicker, setDisplayPicker] = useState(false)

  useEffect(() => {
    const root = rootElement?.current
    if (!root) return
    const handleClick = () => {
      setDisplayPicker(false)
    }
    root.addEventListener('click', handleClick)

    return () => {
      root.removeEventListener('click', handleClick)
    }
  })

  return (
    <div
      className={styles.inputColor}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div
        role='button'
        className={styles.pickerButton}
        style={{
          backgroundColor: value
        }}
        onClick={() => setDisplayPicker(true)}
      ></div>
      {displayPicker &&
        <div className={styles.cover}>
          {/* TODO: ColorPickerの外側がクリックされた時のみに閉じる */}
          <ChromePicker
            color={value}
            onChange={(color) => {
              onBlur?.(color.hex.toUpperCase())
            }}
          />
        </div>
      }
      <input
        type='text'
        key={value}
        defaultValue={value}
        className={styles.inputField}
        onBlur={(e) => onBlur?.(e.currentTarget.value)}
      />
    </div>
  )
}
