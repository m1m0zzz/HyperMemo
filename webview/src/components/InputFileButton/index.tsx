import { ReactNode, useRef } from 'react'
import { FiDownload } from 'react-icons/fi'

import styles from './InputFileButton.module.css'

interface Props {
  children?: ReactNode
  accept?: string
  onChange?: (text: string) => void
}

export function InputFileButton({
  children = 'Import file',
  accept,
  onChange
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        className={styles.button}
        onClick={() => inputRef.current?.click()}
      >
        <FiDownload size={16} />
        {children}
      </button>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        className={styles.inputField}
        onChange={(event) => {
          const file = event.currentTarget.files?.item(0)
          if (!file) return
          console.log(file.name)
          const reader = new FileReader()
          reader.readAsText(file)
          reader.onload = () => onChange?.(reader.result as string)
        }}
      />
    </>
  )
}
