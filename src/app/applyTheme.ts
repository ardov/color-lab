import { entries } from '@/shared/types'

export function applyTheme(node: HTMLElement, theme: Object) {
  entries(flattenTheme(theme)).forEach(([key, val]) => {
    node.style.setProperty('--' + key, val)
  })
}

export function flattenTheme(theme: Object) {
  let keyval: Record<string, string> = {}
  addKeys(theme)
  return keyval

  function addKeys(node: Object, path: string[] = []) {
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        //@ts-ignore
        let val = node[key] as string | number | Object
        if (typeof val === 'string') {
          let cssName = [...path, key].join('-')
          keyval[cssName] = val
        } else if (typeof val === 'number') {
          let cssName = [...path, key].join('-')
          keyval[cssName] = val.toString()
        } else {
          addKeys(val, [...path, key])
        }
      }
    }
  }
}
