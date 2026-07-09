/**
 * parseMarkdown - Hybrid Markdown + LaTeX text parser
 *
 * Xử lý nội dung có chứa:
 * - Công thức LaTeX toán học: $$...$$, $...$  → được render bởi MathJax
 * - Lệnh định dạng LaTeX văn bản: \textbf, \textit, \rule, \vspace, \noindent, v.v.
 * - Cú pháp Markdown: **bold**, *italic*, `code`, xuống dòng \n
 *
 * Thuật toán (tránh xung đột giữa Markdown và LaTeX):
 * 1. Trích xuất các khối math ($$...$$, $...$) và LaTeX text commands ra "placeholders"
 *    an toàn TRƯỚC khi HTML escape. Placeholders dùng ký tự Unicode hiếm gặp
 *    (\uFFF9...\uFFFB) để đảm bảo không bị escape hay nhầm lẫn.
 * 2. HTML escape phần văn bản còn lại (&, <, >)
 * 3. Áp dụng cú pháp Markdown (**bold**, *italic*, v.v.)
 * 4. Chuyển \n thành <br />
 * 5. Khôi phục các placeholders thành HTML/LaTeX thực
 */
export const parseMarkdown = (text) => {
  if (!text) return '';

  const blocks = [];
  let counter = 0;
  let processedText = text;

  /**
   * Tạo placeholder Unicode an toàn cho mỗi block.
   * \uFFF9 (INTERLINEAR ANNOTATION ANCHOR) và \uFFFB (INTERLINEAR ANNOTATION TERMINATOR)
   * là những ký tự cực hiếm gặp trong văn bản/LaTeX thông thường.
   */
  const reserve = (html) => {
    const marker = `\uFFF9${counter++}\uFFFB`;
    blocks.push({ marker, html });
    return marker;
  };

  // ── BƯỚC 1: Trích xuất công thức toán ────────────────────────────────────
  // Display math: $$ ... $$ (multiline ok)
  processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) =>
    reserve(`$$${formula}$$`)
  );
  // Inline math: $ ... $ (không chứa newline hay $ lồng nhau)
  processedText = processedText.replace(/\$([^\n$]+?)\$/g, (_, formula) =>
    reserve(`$${formula}$`)
  );

  // ── BƯỚC 2: Trích xuất lệnh định dạng LaTeX văn bản ───────────────────────
  // \textbf{...} → <strong>
  processedText = processedText.replace(/\\textbf\{([^}]*)\}/g, (_, c) =>
    reserve(`<strong>${c}</strong>`)
  );
  // \textit{...} → <em>
  processedText = processedText.replace(/\\textit\{([^}]*)\}/g, (_, c) =>
    reserve(`<em>${c}</em>`)
  );
  // \emph{...} → <em>
  processedText = processedText.replace(/\\emph\{([^}]*)\}/g, (_, c) =>
    reserve(`<em>${c}</em>`)
  );
  // \underline{...} → <u>
  processedText = processedText.replace(/\\underline\{([^}]*)\}/g, (_, c) =>
    reserve(`<u>${c}</u>`)
  );
  // \texttt{...} → <code>
  processedText = processedText.replace(/\\texttt\{([^}]*)\}/g, (_, c) =>
    reserve(`<code class="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">${c}</code>`)
  );
  // \rule{w}{h} → <hr>
  processedText = processedText.replace(/\\rule\{[^}]*\}\{[^}]*\}/g, () =>
    reserve(`<hr class="my-3 border-gray-300 dark:border-gray-600" />`)
  );
  // \vspace{...} → khoảng trắng dọc
  processedText = processedText.replace(/\\vspace\{[^}]*\}/g, () =>
    reserve(`<div class="my-2"></div>`)
  );
  // \hspace{...} → khoảng trắng ngang
  processedText = processedText.replace(/\\hspace\{[^}]*\}/g, () =>
    reserve(`&nbsp;&nbsp;`)
  );
  // \noindent → xóa (không có indent trong web)
  processedText = processedText.replace(/\\noindent\s*/g, '');
  // \par → xuống dòng đôi
  processedText = processedText.replace(/\\par\b/g, '\n\n');
  // \\ (xuống dòng LaTeX) → xuống dòng
  processedText = processedText.replace(/\\\\\s*/g, '\n');

  // ── BƯỚC 3: HTML escape phần văn bản thuần ───────────────────────────────
  // Placeholders (\uFFF9digits\uFFFB) không chứa &, <, > nên không bị escape.
  let html = processedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── BƯỚC 4: Cú pháp Markdown ─────────────────────────────────────────────
  // **bold** và __bold__
  html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_\n]+?)__/g, '<strong>$1</strong>');
  // *italic* (không nhầm với **)
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  // _italic_ (chỉ match khi không nằm giữa ký tự word, tránh nhầm subscript LaTeX)
  html = html.replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '<em>$1</em>');
  // `code`
  html = html.replace(/`([^`\n]+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded font-mono text-sm">$1</code>');
  // Xuống dòng: \r\n → <br>, \n → <br>
  html = html.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />');

  // ── BƯỚC 5: Khôi phục tất cả blocks ──────────────────────────────────────
  for (const { marker, html: blockHtml } of blocks) {
    // Dùng split/join thay replace để tránh "$" trong blockHtml bị nhầm là backreference
    html = html.split(marker).join(blockHtml);
  }

  return html;
};
