import { createPlaceholderStore } from './placeholderStore';
import { reserveLatexBlocks } from './latexTextTransforms';
import { applyInlineMarkdown, escapePlainText } from './markdownTransforms';

export const parseMarkdown = (text) => {
  if (!text) {
    return '';
  }

  const placeholders = createPlaceholderStore();
  const textWithPlaceholders = reserveLatexBlocks(text, placeholders.reserve);
  const escapedHtml = escapePlainText(textWithPlaceholders);
  const markdownHtml = applyInlineMarkdown(escapedHtml);

  return placeholders.restore(markdownHtml);
};
