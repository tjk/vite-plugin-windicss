import type { ExtractorResultDetailed } from 'windicss/types/interfaces'
import { DefaultExtractor } from '../extractors/default'

const regexTemplate = /<template.*?lang=['"]pug['"][^>]*?>\n([\s\S]*?\n)<\/template>/gm

export const PugWrapper: {
  Pug?: typeof import('pug')
} = {}

export function PugExtractor(code: string, id?: string): ExtractorResultDetailed {
  if (!PugWrapper.Pug) {
    return DefaultExtractor(code)
  }

  const compile = (code: string) => {
    try {
      return PugWrapper.Pug.compile(code, { filename: id })()
      // other build processes will catch pug errors
    }
    catch {}
  }

  let compiled: string | undefined

  if (id && id.match(/\.vue$/)) {
    const matches = Array.from(code.matchAll(regexTemplate))
    let tail = ''
    for (const match of matches) {
      if (match && match[1])
        tail += `\n\n${compile(match[1])}`
    }
    if (tail)
      compiled = `${code}\n\n${tail}`
  }
  else {
    compiled = compile(code)
  }

  return DefaultExtractor(compiled || code)
}
