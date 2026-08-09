"use strict";

    const REPORTS_URL = "https://drive.google.com/drive/folders/1hbUShqWaIOfPbgR32idlKteJlBfa2HLw";
    const RESULT_SCORES = { amazon: 92, shein: 97, grupo: 100 };
    const BEST_SITE = "grupo";
    const WORST_SITE = "amazon";
    const SITE_NAMES = {
      amazon: "Amazon Brasil",
      shein: "SHEIN Brasil",
      grupo: "Site do grupo"
    };

    const root = document.documentElement;
    const accessToggle = document.getElementById("accessToggle");
    const accessPanel = document.getElementById("accessPanel");
    const accessClose = document.getElementById("accessClose");
    const themeToggle = document.getElementById("themeToggle");
    const contrastToggle = document.getElementById("contrastToggle");
    const reportsLink = document.getElementById("reportsLink");
    const fontDown = document.getElementById("fontDown");
    const fontReset = document.getElementById("fontReset");
    const fontUp = document.getElementById("fontUp");

    const guessForm = document.getElementById("guessForm");
    const quizError = document.getElementById("quizError");
    const quizStatus = document.getElementById("quizStatus");
    const revealButton = document.getElementById("revealResults");
    const confirmButton = document.getElementById("confirmGuess");
    const firstGuessInput = document.querySelector('#guessForm input[name="best-site"]');
    const resetButton = document.getElementById("resetGuess");
    const revealPanel = document.getElementById("revealPanel");
    const revealFeedback = document.getElementById("revealFeedback");
    const revealTitle = document.getElementById("revealTitle");
    const continueAnalysis = document.getElementById("continueAnalysis");
    const postRevealSections = Array.from(document.querySelectorAll("[data-post-reveal='true']"));
    const navAfterReveal = Array.from(document.querySelectorAll(".nav-after-reveal"));
    const resultHeading = document.getElementById("titulo-comparativo");

    let fontScale = 1;
    let guessConfirmed = false;
    let resultsRevealed = false;
    let lastFocusedBeforePanel = null;

    function visibleFocusable(container) {
      return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => !element.hidden && element.getClientRects().length > 0);
    }

    function trapAccessPanelFocus(event) {
      if (event.key !== "Tab" || accessPanel.hidden) return;
      const items = visibleFocusable(accessPanel);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function closeAccessPanel() {
      accessPanel.hidden = true;
      accessToggle.setAttribute("aria-expanded", "false");
      (lastFocusedBeforePanel || accessToggle).focus();
    }

    function focusTargetFromHash(hash, updateHistory = false) {
      if (!hash || !hash.startsWith("#")) return false;
      const target = document.querySelector(hash);
      if (!target || target.hidden || target.closest("[hidden]")) return false;

      const focusTarget = target.matches('[tabindex="-1"]')
        ? target
        : target.querySelector('h1[tabindex="-1"], h2[tabindex="-1"], h3[tabindex="-1"], [tabindex="-1"]');
      if (!focusTarget) return false;

      if (updateHistory && window.location.hash !== hash) history.pushState(null, "", hash);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      focusTarget.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      window.setTimeout(() => focusTarget.focus({ preventScroll: true }), reduceMotion ? 0 : 220);
      return true;
    }

    function savePrefs() {
      localStorage.setItem("ihc-accessibility-prefs", JSON.stringify({
        theme: root.dataset.theme,
        contrast: root.dataset.contrast,
        fontScale
      }));
    }

    function updateControls() {
      const isLight = root.dataset.theme === "light";
      const isHigh = root.dataset.contrast === "high";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      contrastToggle.setAttribute("aria-pressed", String(isHigh));
      themeToggle.textContent = isLight ? "Tema escuro" : "Tema claro";
      contrastToggle.textContent = isHigh ? "Contraste normal" : "Alto contraste";
    }

    function setFontScale(value) {
      fontScale = Math.max(.85, Math.min(1.35, value));
      root.style.setProperty("--font-scale", fontScale.toFixed(2));
      savePrefs();
    }

    function getCheckedValue(name) {
      const checked = guessForm.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : "";
    }

    function setError(message) {
      if (message) {
        quizError.hidden = false;
        quizError.textContent = message;
      } else {
        quizError.hidden = true;
        quizError.textContent = "";
      }
    }

    function setQuizStatus(message) {
      quizStatus.textContent = message;
    }

    function setGuessInputsDisabled(disabled) {
      guessForm.querySelectorAll("input[type='radio']").forEach((input) => {
        input.disabled = disabled;
      });
    }

    function revealPostContent() {
      postRevealSections.forEach((section) => {
        section.hidden = false;
      });
      navAfterReveal.forEach((link) => {
        link.hidden = false;
      });
    }

    function validateGuess(bestGuess, worstGuess) {
      if (!bestGuess || !worstGuess) {
        return "Selecione um site para a melhor pontuação e outro para a pior pontuação.";
      }
      if (bestGuess === worstGuess) {
        return "O mesmo site não pode ser escolhido como melhor e pior ao mesmo tempo.";
      }
      return "";
    }

    function resetQuiz() {
      guessForm.reset();
      guessConfirmed = false;
      resultsRevealed = false;
      setError("");
      setQuizStatus("Faça seu palpite antes de revelar as notas.");
      confirmButton.disabled = false;
      revealButton.disabled = true;
      resetButton.disabled = true;
      revealPanel.hidden = true;
      revealFeedback.textContent = "";
      setGuessInputsDisabled(false);
      postRevealSections.forEach((section) => {
        section.hidden = true;
      });
      navAfterReveal.forEach((link) => {
        link.hidden = true;
      });
      firstGuessInput.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      window.setTimeout(() => firstGuessInput.focus({ preventScroll: true }), 180);
    }

    try {
      const stored = JSON.parse(localStorage.getItem("ihc-accessibility-prefs") || "null");
      if (stored) {
        if (["dark", "light"].includes(stored.theme)) root.dataset.theme = stored.theme;
        if (["normal", "high"].includes(stored.contrast)) root.dataset.contrast = stored.contrast;
        if (typeof stored.fontScale === "number") setFontScale(stored.fontScale);
      }
    } catch (_) {}
    updateControls();

    accessToggle.addEventListener("click", () => {
      const willOpen = accessPanel.hidden;
      if (willOpen) {
        lastFocusedBeforePanel = document.activeElement;
        accessPanel.hidden = false;
        accessToggle.setAttribute("aria-expanded", "true");
        accessClose.focus();
      } else {
        closeAccessPanel();
      }
    });

    accessClose.addEventListener("click", closeAccessPanel);

    document.addEventListener("keydown", (event) => {
      trapAccessPanelFocus(event);
      if (event.key === "Escape" && !accessPanel.hidden) closeAccessPanel();
    });

    fontDown.addEventListener("click", () => setFontScale(fontScale - .1));
    fontReset.addEventListener("click", () => setFontScale(1));
    fontUp.addEventListener("click", () => setFontScale(fontScale + .1));

    themeToggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      updateControls();
      savePrefs();
    });

    contrastToggle.addEventListener("click", () => {
      root.dataset.contrast = root.dataset.contrast === "high" ? "normal" : "high";
      updateControls();
      savePrefs();
    });

    document.getElementById("prefsReset").addEventListener("click", () => {
      root.dataset.theme = "dark";
      root.dataset.contrast = "normal";
      setFontScale(1);
      updateControls();
      savePrefs();
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        if (focusTargetFromHash(hash, true)) event.preventDefault();
      });
    });

    if (/^https?:\/\//i.test(REPORTS_URL)) {
      reportsLink.href = REPORTS_URL;
      reportsLink.target = "_blank";
      reportsLink.rel = "noopener noreferrer";
    } else {
      reportsLink.addEventListener("click", (event) => {
        event.preventDefault();
        setQuizStatus("O link público dos relatórios ainda precisa ser configurado.");
      });
    }

    guessForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const bestGuess = getCheckedValue("best-site");
      const worstGuess = getCheckedValue("worst-site");
      const validationMessage = validateGuess(bestGuess, worstGuess);

      if (validationMessage) {
        setError(validationMessage);
        setQuizStatus("Corrija o palpite para continuar.");
        return;
      }

      setError("");
      guessConfirmed = true;
      resultsRevealed = false;
      confirmButton.disabled = true;
      revealButton.disabled = false;
      resetButton.disabled = false;
      revealPanel.hidden = true;
      revealFeedback.textContent = "";
      setGuessInputsDisabled(true);
      setQuizStatus("Palpite confirmado localmente neste navegador. Agora já é possível revelar os resultados.");
      revealButton.focus();
    });

    revealButton.addEventListener("click", () => {
      if (!guessConfirmed) {
        setError("Confirme seu palpite antes de revelar os resultados do Lighthouse.");
        setQuizStatus("A revelação está bloqueada até que o palpite seja confirmado.");
        return;
      }

      const bestGuess = getCheckedValue("best-site");
      const worstGuess = getCheckedValue("worst-site");
      const bestCorrect = bestGuess === BEST_SITE;
      const worstCorrect = worstGuess === WORST_SITE;

      resultsRevealed = true;
      revealButton.disabled = true;
      revealPanel.hidden = false;
      revealPostContent();

      const bestMessage = bestCorrect
        ? `Você acertou a melhor pontuação: ${SITE_NAMES[BEST_SITE]} (${RESULT_SCORES[BEST_SITE]}).`
        : `Melhor pontuação: ${SITE_NAMES[BEST_SITE]} (${RESULT_SCORES[BEST_SITE]}). Você marcou ${SITE_NAMES[bestGuess]}.`;
      const worstMessage = worstCorrect
        ? `Você acertou a pior pontuação: ${SITE_NAMES[WORST_SITE]} (${RESULT_SCORES[WORST_SITE]}).`
        : `Pior pontuação: ${SITE_NAMES[WORST_SITE]} (${RESULT_SCORES[WORST_SITE]}). Você marcou ${SITE_NAMES[worstGuess]}.`;

      revealFeedback.innerHTML = `<p><strong>${bestMessage}</strong></p><p>${worstMessage}</p>`;
      setQuizStatus("Resultados revelados. Agora compare o palpite com as notas oficiais.");
      revealTitle.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      window.setTimeout(() => revealTitle.focus({ preventScroll: true }), 220);
    });

    resetButton.addEventListener("click", resetQuiz);
