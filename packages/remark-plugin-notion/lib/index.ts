import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown'
import type { Root } from 'mdast'
import type { Processor } from 'unified'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'

export function notionFromMarkdown(): FromMarkdownExtension {
  const gfmExtensions = gfmFromMarkdown()
  const mergedExtension: FromMarkdownExtension = {
    enter: {},
    exit: {}
  }
  
  for (const ext of gfmExtensions) {
    if (ext.enter) {
      Object.assign(mergedExtension.enter!, ext.enter)
    }
    if (ext.exit) {
      Object.assign(mergedExtension.exit!, ext.exit)
    }
  }
  
  return mergedExtension
}

export function notionToMarkdown(): ToMarkdownExtension {
  const gfmExtension = gfmToMarkdown()
  return {
    handlers: {
      ...gfmExtension.handlers
    }
  }
}

export function remarkNotion(this: Processor<Root>) {
  const self = this
  const data = self.data()

  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = [])
  
  fromMarkdownExtensions.push(notionFromMarkdown())
  toMarkdownExtensions.push(notionToMarkdown())
}

export { remarkNotion as default }