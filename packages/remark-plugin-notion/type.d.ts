import { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import { Options as ToMarkdownExtension } from 'mdast-util-to-markdown';
import 'unified';

declare module 'unified' {
  interface Data {
    fromMarkdownExtensions?: FromMarkdownExtension[];
    toMarkdownExtensions?: ToMarkdownExtension[];
  }
}
