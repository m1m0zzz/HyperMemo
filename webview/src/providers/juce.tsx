import { noteNumber } from '@tremolo-ui/functions'
import { getNativeFunction } from 'juce-framework-frontend-mirror'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
  fontName: string
  fontWeight: string
  textAlign: TextAlign
  texts: string[]
}

type Action = {
  setMode: (v: Mode) => void
  setFullScreen: (v: boolean) => void
  setModalIsOpen: (v: boolean) => void
  setEditNoteNumber: (v: number) => void
  setBgColor: (v: string) => void
  setFontColor: (v: string) => void
  setFontSize: (v: number) => void
  setFontName: (v: string) => void
  setFontWeight: (v: string) => void
  setTextAlign: (v: TextAlign) => void
  setTexts: (texts: string[]) => void
  setTextAt: (text: string, index: number) => void
}

type JuceStore = Awaited<ReturnType<typeof createJuceStore>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JuceFunction = (...args: any[]) => number | Promise<any>

const createJuceStore = (initProps: Partial<State>, changeState: JuceFunction) => {
  const DEFAULT_STATES: State = {
    mode: 'midi',
    fullScreen: false,
    modalIsOpen: false,
    editNoteNumber: noteNumber('C0'),
    bgColor: '#FFFFFF',
    fontColor: '#000000',
    fontSize: 32,
    fontName: 'system-ui',
    fontWeight: '400',
    textAlign: 'center',
    texts: [],
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
    setFontName: (value) =>
      set(() => {
        changeState('fontName', value)
        return { fontName: value }
      }),
    setFontWeight: (value) =>
      set(() => {
        changeState('fontWeight', value)
        return { fontWeight: value }
      }),
    setTextAlign: (value) =>
      set(() => {
        changeState('textAlign', value)
        return { textAlign: value }
      }),
    setTexts: (texts) =>
      set(() => {
        changeState('texts', texts)
        return { texts: texts }
      }),
    setTextAt: (text, index) =>
      set((state) => {
        const newItem = [...state.texts]
        newItem[index] = text
        changeState('texts', newItem)
        return { texts: newItem }
      }),
  }))
}

const JuceContext = createContext<JuceStore | null>(null)

type JuceProviderProps = PropsWithChildren<Partial<State>>

function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}

export function JuceProvider({ children, ...props }: JuceProviderProps) {
  const storeRef = useRef<JuceStore>(null)
  const [savedStates, setSavedStates] = useState<Partial<State>>({})

  const loadState = getNativeFunction('loadState')
  const changeState = getNativeFunction('changeState')

  const loadInitialData = useCallback(() => {
    const data = window.__JUCE__.initialisationData
    return cleanObject<Partial<State>>({
      mode: data.mode[0],
      fullScreen: data.fullScreen[0],
      editNoteNumber: data.editNoteNumber[0],
      bgColor: data.bgColor[0],
      fontColor: data.fontColor[0],
      fontSize: data.fontSize[0],
      fontName: data.fontName[0],
      fontWeight: data.fontWeight[0],
      textAlign: data.textAlign[0],
      texts: data.texts[0],
    })
  }, [])

  if (!storeRef.current) {
    const initials = loadInitialData()
    storeRef.current = createJuceStore({...savedStates, ...initials, ...props}, changeState)
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.setState({...savedStates,...props})
    } else {
      const initials = loadInitialData()
      storeRef.current = createJuceStore({...savedStates, ...initials, ...props}, changeState)
    }
  }, [changeState, loadInitialData, props, savedStates])

  useEffect(() => {
    const load = async () => {
      setSavedStates({
        mode: await loadState('mode'),
        fullScreen: Boolean(await loadState('fullScreen')),
        editNoteNumber: await loadState('editNoteNumber'),
        bgColor: await loadState('bgColor'),
        fontColor: await loadState('fontColor'),
        fontSize: Number(await loadState('fontSize')),
        fontName: await loadState('fontName'),
        fontWeight: await loadState('fontWeight'),
        textAlign: await loadState('textAlign'),
        texts: await loadState('texts'),
      })
    }
    load()
  }, [])

  useEffect(() => {
    // NOTE: Process to change editNumber by midi input.
    const id = window.__JUCE__.backend.addEventListener(
      'onChangeEditNoteNumber',
      (num) => {
        setSavedStates({...savedStates, editNoteNumber: num})
      }
    )

    return () => {
      window.__JUCE__.backend.removeEventListener(id)
    }
  }, [])

  return (
    <JuceContext.Provider value={storeRef.current}>
      {children}
    </JuceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useJuceContext<T>(selector: (state: State & Action) => T): T {
  const store = useContext(JuceContext)
  if (!store) throw new Error('Missing JuceContext.Provider in the tree')
  return useStore(store, selector)
}
