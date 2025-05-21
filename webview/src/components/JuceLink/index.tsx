import { getNativeFunction } from "juce-framework-frontend-mirror"
import { ComponentPropsWithoutRef, ReactNode } from "react"

interface Props {
  href: string
  children: ReactNode
}

export function JuceLink({
  href,
  children,
  onClick,
  ...props
}: Props & Omit<ComponentPropsWithoutRef<'a'>, keyof Props>) {
  const openInBrowser = getNativeFunction('openInBrowser')

  return (
    <a
      href={href}
      onClick={async (e) => {
        onClick?.(e)
        console.log('open ', href)
        await openInBrowser(href)
      }}
      {...props}
    >{children}</a>
  )
}
