(() => {
  /* ─── Selectors ─── */
  const grid      = document.querySelector("[data-quotes-grid]");
  const toast     = document.querySelector("[data-toast]");
  const toastText = document.querySelector("[data-toast-text]");

  let toastTimer   = null;
  let activeToasts = 0;

  /* ─── Toast ─── */
  function showToast(msg, type = "success") {
    if (!toast || !toastText) return;

    toastText.textContent = msg;
    toast.dataset.type = type;           // lets CSS colour success/error differently
    toast.classList.add("show");

    activeToasts++;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
      activeToasts = 0;
    }, type === "error" ? 2000 : 1200);
  }

  /* ─── Clipboard ─── */
  async function copyText(text, label = "Copied") {
    if (!text) return showToast("Nothing to copy", "error");

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} ✓`);
      } catch {
        fallbackCopy(text, label);
      }
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label = "Copied") {
    const el = Object.assign(document.createElement("textarea"), {
      value: text,
      style: "position:fixed;opacity:0;pointer-events:none",
    });
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    showToast(ok ? `${label} ✓` : "Copy failed — try manually", ok ? "success" : "error");
  }

  /* ─── Web Share API ─── */
  async function shareText(text, title = "Quotes") {
    if (!navigator.share) return copyText(text, "Copied (no Share API)");
    try {
      await navigator.share({ title, text });
      showToast("Shared ✓");
    } catch (err) {
      if (err.name !== "AbortError") showToast("Share failed", "error");
    }
  }

  /* ─── Helpers ─── */
  function getQuoteText(card) {
    return card.querySelector(".quoteText")?.innerText.trim() ?? "";
  }

  function getAllQuotes() {
    return [...document.querySelectorAll("[data-quote]")]
      .map(getQuoteText)
      .filter(Boolean);
  }

  function getAllQuotesFormatted() {
    return getAllQuotes()
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n\n");
  }

  function safeName(topic) {
    return (topic ?? "quotes")
      .toString()
      .trim()
      .replace(/[^\w\-]+/g, "_")
      .slice(0, 40) || "quotes";
  }

  /* ─── Card copy — event-delegation + keyboard ─── */
  function handleCardAction(e) {
    const copyBtn  = e.target.closest("[data-copy-one]");
    const shareBtn = e.target.closest("[data-share-one]");
    const card     = e.target.closest("[data-quote]");
    if (!card) return;

    if (copyBtn)  copyText(getQuoteText(card));
    if (shareBtn) shareText(getQuoteText(card));
  }

  grid?.addEventListener("click",   handleCardAction);
  grid?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") handleCardAction(e);
  });

  /* ─── Copy all ─── */
  document.querySelector("[data-copy-all]")?.addEventListener("click", () => {
    const all = getAllQuotes().join("\n\n");
    copyText(all, "All copied");
  });

  /* ─── Share all ─── */
  document.querySelector("[data-share-all]")?.addEventListener("click", () => {
    shareText(getAllQuotesFormatted(), window.__TOPIC__ || "Quotes");
  });

  /* ─── Download ─── */
  document.querySelector("[data-download]")?.addEventListener("click", () => {
    const formatted = getAllQuotesFormatted();
    if (!formatted) return showToast("No quotes to download", "error");

    const filename = `${safeName(window.__TOPIC__)}_quotes.txt`;
    const url      = URL.createObjectURL(new Blob([formatted], { type: "text/plain" }));
    const anchor   = Object.assign(document.createElement("a"), { href: url, download: filename });

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);   // clean up object URL

    showToast("Downloaded ✓");
  });

  /* ─── Keyboard shortcut: Ctrl/Cmd + Shift + C → copy all ─── */
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
      e.preventDefault();
      const all = getAllQuotes().join("\n\n");
      copyText(all, "All copied");
    }
  });
})();