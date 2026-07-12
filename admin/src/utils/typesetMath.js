export const typesetMath = (root = document.body) => {
  const mathJax = window.MathJax;
  if (!mathJax || !root) return;

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
};
