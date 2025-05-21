import { noteNumber } from '@tremolo-ui/functions'
import { getNativeFunction } from 'juce-framework-frontend-mirror'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef } from 'react'
import { createStore, useStore } from 'zustand'

export type TextAlign = 'left' | 'center' | 'right'
export type Mode = 'init' | 'sync' | 'midi'

type SharedState = {
  mode: Mode
  fullScreen: boolean
  editNoteNumber: number
  fontColor: string
  bgColor: string
  fontSize: number
  fontName: string
  fontWeight: string
  textAlign: TextAlign
  texts: string[]
}

type FrontendState = {
  modalIsOpen: boolean
  canUndo: boolean
  canRedo: boolean
}

type State = SharedState & FrontendState

type Action = {
  undo: () => void
  redo: () => void

  setMode: (v: Mode) => void
  setFullScreen: (v: boolean) => void
  setEditNoteNumber: (v: number) => void
  setBgColor: (v: string) => void
  setFontColor: (v: string) => void
  setFontSize: (v: number) => void
  setFontName: (v: string) => void
  setFontWeight: (v: string) => void
  setTextAlign: (v: TextAlign) => void
  setTexts: (texts: string[]) => void
  setTextAt: (text: string, index: number) => void
  setModalIsOpen: (v: boolean) => void // only frontend
}

type JuceStore = ReturnType<typeof createJuceStore>

export const MIN_NOTE_NUMBER = 0
export const MAX_NOTE_NUMBER = 127

const createJuceStore = (initProps: Partial<State>) => {
  const loadState = getNativeFunction('loadState')
  const changeState = getNativeFunction('changeState')
  const undo = getNativeFunction('undo')
  const redo = getNativeFunction('redo')

  const reload = async () => {
    return {
      mode: await loadState('mode'),
      fullScreen: await loadState('fullScreen'),
      editNoteNumber: await loadState('editNoteNumber'),
      bgColor: await loadState('bgColor'),
      fontColor: await loadState('fontColor'),
      fontSize: await loadState('fontSize'),
      fontName: await loadState('fontName'),
      fontWeight: await loadState('fontWeight'),
      textAlign: await loadState('textAlign'),
      texts: await loadState('texts'),
    }
  }

  const DEFAULT_STATES: State = {
    mode: 'midi',
    fullScreen: false,
    editNoteNumber: noteNumber('C0'),
    bgColor: '#FFFFFF',
    fontColor: '#000000',
    fontSize: 32,
    fontName: 'system-ui',
    fontWeight: '400',
    textAlign: 'center',
    texts: [],
    modalIsOpen: false,
    canUndo: false,
    canRedo: false,
  }

  return createStore<State & Action>()((set) => ({
    ...DEFAULT_STATES,
    ...initProps,
    undo: () => {
      undo().then(() => {
        reload().then((states) => {
          set(() => states)
        })
      })
    },
    redo: () => {
      redo().then(() => {
        reload().then((states) => {
          set(() => states)
        })
      })
    },
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
    setModalIsOpen: (value) => set(() => ({ modalIsOpen: value })),
  }))
}

const JuceContext = createContext<JuceStore | null>(null)

type JuceProviderProps = PropsWithChildren<Partial<State>>

/** remove undefined in object. */
function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != undefined)
  ) as Partial<T>
}

export function JuceProvider({ children, ...props }: JuceProviderProps) {
  const storeRef = useRef<JuceStore>(null)

  const loadInitialData = useCallback(() => {
    const data = window.__JUCE__.initialisationData
    return cleanObject<SharedState>({
      mode: data.mode?.[0],
      fullScreen: data.fullScreen?.[0],
      editNoteNumber: data.editNoteNumber?.[0],
      bgColor: data.bgColor?.[0],
      fontColor: data.fontColor?.[0],
      fontSize: data.fontSize?.[0],
      fontName: data.fontName?.[0],
      fontWeight: data.fontWeight?.[0],
      textAlign: data.textAlign?.[0],
      texts: data.texts?.[0],
    })
  }, [])


  if (!storeRef.current) {
    const initials = loadInitialData()
    storeRef.current = createJuceStore({...initials, ...props})
  }

  useEffect(() => {
    if (storeRef.current) {
      // console.log('update state')
      storeRef.current.setState({...props})
    } else {
      const initials = loadInitialData()
      storeRef.current = createJuceStore({...initials, ...props})
    }
  }, [loadInitialData, props])

  useEffect(() => {
    // NOTE: Process to change editNumber by midi input.
    const onChangeEditNoteNumberId = window.__JUCE__.backend.addEventListener(
      'onChangeEditNoteNumber',
      (editNoteNumber) => {
        storeRef.current?.setState({editNoteNumber})
      }
    )
    const onChangeCanUndoOrRedoId = window.__JUCE__.backend.addEventListener(
      'onChangeCanUndoOrRedo',
      ([canUndo, canRedo]) => {
        storeRef.current?.setState({canUndo, canRedo})
      }
    )

    return () => {
      window.__JUCE__.backend.removeEventListener(onChangeEditNoteNumberId)
      window.__JUCE__.backend.removeEventListener(onChangeCanUndoOrRedoId)
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
