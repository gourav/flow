import { CSSProperties } from 'react'

import { Contents } from '@flow/epubjs'

import { Settings } from './state'
import { keys } from './utils'

export const activeClass = 'bg-primary70'
export const defaultStyle = {
  html: {
    padding: '0 !important',
  },
  body: {
    background: 'transparent',
  },
  'a:any-link': {
    color: '#3b82f6 !important',
    'text-decoration': 'none !important',
  },
  '::selection': {
    'background-color': 'rgba(3, 102, 214, 0.2)',
  },
  p: {
    'text-indent': '2rem'
  },

  'p a:any-link': {
    color: '#0f172a !important',
    'font-weight': '700 !important',
    'text-decoration-line': 'underline !important',
    'text-underline-offset': '6px'
  }
}

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

function mapToCss(o: CSSProperties) {
  return keys(o)
    .filter((k) => o[k] !== undefined)
    .map((k) => `${camelToSnake(k)}: ${o[k]} !important;`)
    .join('\n')
}

enum Style {
  Custom = 'custom',
}

export function updateCustomStyle(
  contents: Contents | undefined,
  settings: Settings | undefined,
) {
  if (!contents || !settings) return

  const { zoom, ...other } = settings
  let css = `a, article, cite, div, li, p, pre, span, table, body, h1, h2, h3, h4, h5, h6 {
    ${mapToCss(other)}
  }`

  const document = contents.document as Document;

  const cssLinks = document.querySelectorAll('style');
  console.log(cssLinks, document.documentElement.outerHTML);
  if (cssLinks) {
    cssLinks.forEach(cssLink => cssLink.remove());
  }

  // <link href="https://fonts.cdnfonts.com/css/bookerly" rel="stylesheet">
  const bookerlyFontLink = document.createElement('link');
  bookerlyFontLink.href = '/Icons/fonts.css';
  bookerlyFontLink.rel = 'stylesheet';
  document.head.appendChild(bookerlyFontLink);

  if (zoom) {
    const body = contents.content as HTMLBodyElement
    const scale = (p: keyof CSSStyleDeclaration) => ({
      [p]: `${parseInt(body.style[p] as string) / zoom}px`,
    })
    css += `body {
      ${mapToCss({
        transformOrigin: 'top left',
        transform: `scale(${zoom})`,
        ...scale('width'),
        ...scale('height'),
        ...scale('columnWidth'),
        ...scale('columnGap'),
        ...scale('paddingTop'),
        ...scale('paddingBottom'),
        ...scale('paddingLeft'),
        ...scale('paddingRight'),
      })}
    }`
  }

  return contents.addStylesheetCss(css, Style.Custom)
}

export function lock(l: number, r: number, unit = 'px') {
  const minw = 400
  const maxw = 2560

  return `calc(${l}${unit} + ${r - l} * (100vw - ${minw}px) / ${maxw - minw})`
}
