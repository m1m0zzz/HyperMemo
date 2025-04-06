import { atom } from 'jotai'

export const modeAtom = atom<'init' | 'sync' | 'midi'>('midi')
