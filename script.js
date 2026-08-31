/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — interazioni
   Nessuna dipendenza esterna.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Anno corrente nel footer ───────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ── Nav: ombra allo scroll ─────────────────────────────────────── */
  var navWrap = document.querySelector('.nav-wrap');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      navWrap.classList.toggle('is-stuck', window.scrollY > 12);
      ticking = false;
    });
  }
  if (navWrap) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Menu mobile ────────────────────────────────────────────────── */
  var burger = document.querySelector('.nav__burger');
  var menu = document.getElementById('nav-mobile');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    // chiude dopo la scelta di una voce
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Esc chiude e riporta il focus sul pulsante
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });

    // torna alla nav completa quando si passa a desktop
    var wide = window.matchMedia('(min-width: 861px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    wide.addEventListener ? wide.addEventListener('change', onWide)
                          : wide.addListener(onWide);
  }

  /* ── Comparsa degli elementi allo scroll ────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    // stato finale immediato, nessuna animazione
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = Array.prototype.slice.call(
          entry.target.parentElement.querySelectorAll(':scope > .reveal')
        );
        var i = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(i * 60, 300) + 'ms';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ── FAQ: una risposta aperta per volta ─────────────────────────── */
  var items = document.querySelectorAll('.acc__item');
  items.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      items.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ── Form contatti ──────────────────────────────────────────────── */
  var form = document.getElementById('form-contatto');
  if (!form) return;

  var status = document.getElementById('form-status');

  var RULES = {
    nome:     { err: 'err-nome',     msg: 'Serve il nome per sapere con chi parliamo.' },
    email:    { err: 'err-email',    msg: 'Controllate l’indirizzo email: sembra incompleto.' },
    settore:  { err: 'err-settore',  msg: 'Scegliete di cosa vi occupate.' },
    privacy:  { err: 'err-privacy',  msg: 'Serve il consenso per poterci scrivere.' }
  };

  function fieldOf(input) { return input.closest('.field'); }

  function showError(input, message) {
    var rule = RULES[input.name];
    if (!rule) return;
    var box = document.getElementById(rule.err);
    var field = fieldOf(input);
    if (field) field.classList.add('is-invalid');
    if (box) {
      box.textContent = message;
      box.hidden = false;
      input.setAttribute('aria-describedby', rule.err);
    }
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var rule = RULES[input.name];
    if (!rule) return;
    var box = document.getElementById(rule.err);
    var field = fieldOf(input);
    if (field) field.classList.remove('is-invalid');
    if (box) { box.hidden = true; box.textContent = ''; }
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function validate(input) {
    if (!RULES[input.name]) return true;
    var ok = input.type === 'checkbox' ? input.checked : input.checkValidity();
    if (ok) { clearError(input); return true; }
    showError(input, RULES[input.name].msg);
    return false;
  }

  // validazione al blur (non a ogni tasto), correzione immediata dopo l'errore
  Object.keys(RULES).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('change', function () {
      if (input.getAttribute('aria-invalid')) validate(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (status) status.textContent = '';

    var firstInvalid = null;
    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      if (input && !validate(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      if (status) status.textContent = 'Controllate i campi segnalati qui sopra.';
      return;
    }

    var v = function (name) {
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : '—';
    };

    var corpo = [
      'Nome:      ' + v('nome'),
      'Azienda:   ' + v('azienda'),
      'Email:     ' + v('email'),
      'Telefono:  ' + v('telefono'),
      'Settore:   ' + v('settore'),
      '',
      'Messaggio:',
      v('messaggio')
    ].join('\n');

    // ── Senza backend: apre il client di posta col messaggio pronto.
    //    Per ricevere i moduli via web, sostituite questo blocco con una
    //    fetch() verso il vostro endpoint (es. Formspree) e mostrate
    //    l'esito in #form-status.
    var mailto = 'mailto:info@cantieresocial.com'
      + '?subject=' + encodeURIComponent('Richiesta sopralluogo — ' + v('nome'))
      + '&body=' + encodeURIComponent(corpo);

    window.location.href = mailto;

    if (status) {
      status.textContent = 'Stiamo aprendo il vostro programma di posta con il messaggio già scritto: premete invio per spedirlo.';
    }
  });
})();
