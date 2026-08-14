let mathJaxPromise = null;

const loadMathJaxScript = () => {
  if (window.MathJax && typeof window.MathJax.typesetClear === "function") {
    return Promise.resolve(window.MathJax);
  }
  if (mathJaxPromise) return mathJaxPromise;

  mathJaxPromise = new Promise((resolve, reject) => {
    // 1. Configure MathJax before loading script
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
      },
      startup: {
        onload: () => resolve(window.MathJax),
      },
    };

    // 2. Create dynamic script element
    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    script.onload = () => resolve(window.MathJax);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return mathJaxPromise;
};

export const typesetMath = (root = document.body) => {
  loadMathJaxScript()
    .then((mathJax) => {
      const runTypeset = () => {
        if (typeof mathJax.typesetClear === "function") {
          mathJax.typesetClear([root]);
        }
        if (typeof mathJax.typesetPromise === "function") {
          return mathJax.typesetPromise([root]).catch((error) => {
            console.warn("MathJax typeset failed:", error);
          });
        }
        if (typeof mathJax.typeset === "function") {
          mathJax.typeset([root]);
        }
      };

      if (mathJax.startup?.promise) {
        mathJax.startup.promise.then(runTypeset).catch((error) => {
          console.warn("MathJax startup failed:", error);
        });
        return;
      }

      runTypeset();
    })
    .catch((error) => {
      console.warn("Failed to load MathJax dynamically:", error);
    });
};
