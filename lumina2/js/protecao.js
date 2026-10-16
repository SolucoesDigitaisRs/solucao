/* Reduz a inspeção casual; não impede ferramentas externas ou acesso aos arquivos. */
(() => {
  document.addEventListener("contextmenu", (event) => {
    const target = event.target;
    const isEditable = target instanceof Element &&
      (target.closest("input, textarea, select, [contenteditable='true']") !== null);
    if (isEditable) return;
    event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const devToolsShortcut = event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (event.metaKey && event.altKey && ["i", "j", "c"].includes(key));
    const sourceShortcut = (event.ctrlKey || event.metaKey) && ["u", "s"].includes(key);

    if (devToolsShortcut || sourceShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
})();
