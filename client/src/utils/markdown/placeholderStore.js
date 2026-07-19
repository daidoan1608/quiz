import { PLACEHOLDER_END, PLACEHOLDER_START } from './markdownConstants';

export const createPlaceholderStore = () => {
  const blocks = [];
  let counter = 0;

  const reserve = (html) => {
    const marker = `${PLACEHOLDER_START}${counter++}${PLACEHOLDER_END}`;
    blocks.push({ marker, html });
    return marker;
  };

  const restore = (html) =>
    blocks.reduce(
      (currentHtml, { marker, html: blockHtml }) =>
        currentHtml.split(marker).join(blockHtml),
      html
    );

  return { reserve, restore };
};
