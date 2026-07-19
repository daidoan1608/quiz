import { INLINE_CODE_CLASS } from './markdownConstants';

export const escapePlainText = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const applyInlineMarkdown = (html) =>
  html
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '<em>$1</em>')
    .replace(/`([^`\n]+?)`/g, `<code class="${INLINE_CODE_CLASS}">$1</code>`)
    .replace(/\r\n/g, '<br />')
    .replace(/\n/g, '<br />');
