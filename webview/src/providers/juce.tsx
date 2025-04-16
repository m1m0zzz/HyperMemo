import { noteNumber } from '@tremolo-ui/functions'
import { getNativeFunction } from 'juce-framework-frontend-mirror'
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'
import { createStore, useStore } from 'zustand'

export type TextAlign = 'left' | 'center' | 'right'
export type Mode = 'init' | 'sync' | 'midi'

type State = {
  mode: Mode
  fullScreen: boolean
  modalIsOpen: boolean
  editNoteNumber: number
  fontColor: string
  bgColor: string
  fontSize: number
  textAlign: TextAlign
}

type Action = {
  setMode: (v: Mode) => void
  setFullScreen: (v: boolean) => void
  setModalIsOpen: (v: boolean) => void
  setEditNoteNumber: (v: number) => void
  setBgColor: (v: string) => void
  setFontColor: (v: string) => void
  setFontSize: (v: number) => void
  setTextAlign: (v: TextAlign) => void
}

type JuceStore = Awaited<ReturnType<typeof createJuceStore>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JuceFunction = (...args: any[]) => number | Promise<any>

const createJuceStore = (initProps: Partial<State>, changeState: JuceFunction) => {
  const DEFAULT_STATES: State = {
    mode: 'init',
    fullScreen: false,
    modalIsOpen: false,
    editNoteNumber: noteNumber('C0'),
    bgColor: '#ffffff',
    fontColor: '#000000',
    fontSize: 32,
    textAlign: 'center',
  }

  return createStore<State & Action>()((set) => ({
    ...DEFAULT_STATES,
    ...initProps,
    setMode: (value) =>
      set(() => {
        changeState('mode', value)
        return { mode: value }
      }),
    setFullScreen: (value) =>
      set(() => {
        changeState('fullScreen', value)
        return { fullScreen: value }
      }),
    setModalIsOpen: (value) => set(() => ({ modalIsOpen: value })), // Note: I won't save to the juce backend!
    setEditNoteNumber: (value) =>
      set(() => {
        changeState('editNoteNumber', value)
        return { editNoteNumber: value }
      }),
    setBgColor: (value) =>
      set(() => {
        changeState('bgColor', value)
        return { bgColor: value }
      }),
    setFontColor: (value) =>
      set(() => {
        changeState('fontColor', value)
        return { fontColor: value }
      }),
    setFontSize: (value) =>
      set(() => {
        changeState('fontSize', value)
        return { fontSize: value }
      }),
    setTextAlign: (value) =>
      set(() => {
        changeState('textAlign', value)
        return { textAlign: value }
      }),
  }))
}

const JuceContext = createContext<JuceStore | null>(null)

type JuceProviderProps = PropsWithChildren<Partial<State>>

export function JuceProvider({ children, ...props }: JuceProviderProps) {
  const storeRef = useRef<JuceStore>(null)
  const [savedStates, setSavedStates] = useState<Partial<State>>({})

  const loadState = getNativeFunction('loadState')
  const changeState = getNativeFunction('changeState')

  if (!storeRef.current) {
    storeRef.current = createJuceStore({...savedStates, ...props}, changeState)
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.setState({...savedStates, ...props})
    } else {
      storeRef.current = createJuceStore({...savedStates, ...props}, changeState)
    }
  }, [props, savedStates])

  useEffect(() => {
    const load = async () => {
      setSavedStates({
        mode: await loadState('mode'),
        fullScreen: Boolean(await loadState('fullScreen')),
        editNoteNumber: await loadState('editNoteNumber'),
        bgColor: await loadState('bgColor'),
        fontColor: await loadState('fontColor'),
        fontSize: Number(await loadState('fontSize')),
        textAlign: await loadState('textAlign'),
      })
    }
    load()
  }, [])

  return (
    <JuceContext.Provider value={storeRef.current}>
      {children}
    </JuceContext.Provider>
  )
}

export function useJuceContext<T>(selector: (state: State & Action) => T): T {
  const store = useContext(JuceContext)
  if (!store) throw new Error('Missing JuceContext.Provider in the tree')
  return useStore(store, selector)
}
