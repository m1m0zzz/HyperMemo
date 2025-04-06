import { ComponentPropsWithoutRef } from 'react'

import styles from './IconButton.module.css'

export function IconButton({className, children, ...props}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={className ? `${styles['icon-button']} ${className}` : styles['icon-button']}
      {...props}
    >
      {children}
    </button>
  )
}
