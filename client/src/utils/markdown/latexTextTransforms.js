import { escapeHtml } from './htmlEscape';
import { LATEX_TEXTTT_CLASS } from './markdownConstants';

export const reserveLatexBlocks = (text, reserve) => {
  let processedText = text;

  processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) =>
    reserve(`$$${formula}$$`)
  );
  processedText = processedText.replace(/\$([^\n$]+?)\$/g, (_, formula) =>
    reserve(`$${formula}$`)
  );

  processedText = processedText.replace(/\\textbf\{([^}]*)\}/g, (_, content) =>
    reserve(`<strong>${escapeHtml(content)}</strong>`)
  );
  processedText = processedText.replace(/\\textit\{([^}]*)\}/g, (_, content) =>
    reserve(`<em>${escapeHtml(content)}</em>`)
  );
  processedText = processedText.replace(/\\emph\{([^}]*)\}/g, (_, content) =>
    reserve(`<em>${escapeHtml(content)}</em>`)
  );
  processedText = processedText.replace(/\\underline\{([^}]*)\}/g, (_, content) =>
    reserve(`<u>${escapeHtml(content)}</u>`)
  );
  processedText = processedText.replace(/\\texttt\{([^}]*)\}/g, (_, content) =>
    reserve(`<code class="${LATEX_TEXTTT_CLASS}">${escapeHtml(content)}</code>`)
  );
  processedText = processedText.replace(/\\rule\{[^}]*\}\{[^}]*\}/g, () =>
    reserve('<hr class="my-3 border-gray-300 dark:border-gray-600" />')
  );
  processedText = processedText.replace(/\\vspace\{[^}]*\}/g, () =>
    reserve('<div class="my-2"></div>')
  );
  processedText = processedText.replace(/\\hspace\{[^}]*\}/g, () =>
    reserve('&nbsp;&nbsp;')
  );

  return processedText
    .replace(/\\noindent\s*/g, '')
    .replace(/\\par\b/g, '\n\n')
    .replace(/\\\\\s*/g, '\n');
};
