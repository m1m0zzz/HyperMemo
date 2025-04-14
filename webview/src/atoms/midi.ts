import { noteNumber } from "@tremolo-ui/functions"
import { atom } from "jotai"

export type TextAlign = 'left' | 'center' | 'right'

export const fullScreenAtom = atom(false)
export const modalIsOpenAtom = atom(false)
export const editNoteNumberAtom = atom(noteNumber('C0'))
export const fontColorAtom = atom('#000000')
export const bgColorAtom = atom('#ffffff')
export const fontSizeAtom = atom(32)
export const textAlignAtom = atom<TextAlign>('center')
