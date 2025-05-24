import styles from './InputColor.module.css'

interface Props {
  value: string
  onBlur?: (value: string) => void
}

export function InputColor({
  value,
  onBlur,
}: Props) {

  return (
    <div
      className={styles.inputColor}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <label
        role='button'
        className={styles.pickerButton}
        style={{
          backgroundColor: value
        }}
        onClick={() => {
          console.log('click on button')
        }}
      >
        <input
          type="color"
          value={value}
          style={{ visibility: 'hidden' }}
          onChange={(event) => {
            onBlur?.(event.target.value.toUpperCase())
          }}
        />
      </label>
      <input
        type='text'
        key={value}
        defaultValue={value}
        className={styles.inputField}
        onBlur={(e) => onBlur?.(e.currentTarget.value.toUpperCase())}
      />
    </div>
  )
}
