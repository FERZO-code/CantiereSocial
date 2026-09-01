/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — interazioni
   Nessuna dipendenza esterna.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Intro / schermata di apertura ──────────────────────────────────
     Contatore 0→100 con barra di avanzamento, poi l'overlay si solleva.
     Durata volutamente breve: un'intro lunga fa perdere visite.
     Per mostrarla una sola volta a sessione, mettete UNA_VOLTA a true. */
  var UNA_VOLTA = false;
  var DURATA = 3000;   // millisecondi

  (function intro() {
    var root = document.documentElement;
    var box  = document.getElementById('intro');

    function chiudi(subito) {
      root.classList.remove('intro-on');
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }

    // reduced-motion, JS parziale, o intro già vista in questa sessione
    var giaVista = false;
    try { giaVista = UNA_VOLTA && sessionStorage.getItem('intro') === '1'; } catch (e) {}

    if (!box || !root.classList.contains('intro-on') || reduceMotion.matches || giaVista) {
      chiudi(true);
      return;
    }

    try { if (UNA_VOLTA) sessionStorage.setItem('intro', '1'); } catch (e) {}

    var num  = document.getElementById('intro-num');
    var fill = document.getElementById('intro-fill');
    var inizio = null;
    var chiuso = false;

    function esci() {
      if (chiuso) return;
      chiuso = true;
      box.classList.add('is-done');
      root.classList.remove('intro-on');           // sblocca subito lo scorrimento
      setTimeout(function () {
        if (box.parentNode) box.parentNode.removeChild(box);
      }, 900);
    }

    function passo(t) {
      if (inizio === null) inizio = t;
      var p = Math.min((t - inizio) / DURATA, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // decelera verso il 100
      var v = Math.round(eased * 100);

      num.textContent = v;
      fill.style.height = v + '%';

      if (p < 1) {
        requestAnimationFrame(passo);
      } else {
        setTimeout(esci, 180);                     // un attimo sul 100%
      }
    }

    requestAnimationFrame(passo);
    setTimeout(esci, DURATA + 2500);               // rete di sicurezza
  })();


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

    var bottone = form.querySelector('button[type="submit"]');
    var testoOriginale = bottone.textContent;

    function leggi(nome) {
      var el = form.elements[nome];
      return el ? el.value.trim() : '';
    }

    var dati = {
      nome:      leggi('nome'),
      azienda:   leggi('azienda'),
      email:     leggi('email'),
      telefono:  leggi('telefono'),
      settore:   leggi('settore'),
      messaggio: leggi('messaggio'),
      website:   leggi('website'),          // trappola anti-spam
      privacy:   form.elements.privacy.checked
    };

    // stato di attesa: il bottone non è più premibile (evita doppi invii)
    bottone.disabled = true;
    bottone.textContent = 'Invio in corso…';
    form.classList.add('is-sending');
    if (status) {
      status.className = 'form__status';
      status.textContent = 'Stiamo inviando la richiesta…';
    }

    function ripristina() {
      bottone.disabled = false;
      bottone.textContent = testoOriginale;
      form.classList.remove('is-sending');
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dati)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (corpo) {
          return { ok: r.ok, corpo: corpo };
        });
      })
      .then(function (esito) {
        if (esito.ok && esito.corpo.ok) {
          // successo: il modulo lascia il posto alla conferma
          form.innerHTML =
            '<div class="form__done" role="status">' +
              '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" ' +
                'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<circle cx="12" cy="12" r="9"/><path d="M7.5 12.5l3 3 6-6.5"/>' +
              '</svg>' +
              '<p class="form__done-t">Richiesta inviata.</p>' +
              '<p class="form__done-s">Vi rispondiamo entro un giorno lavorativo. ' +
              'Se avete fretta, scriveteci su WhatsApp.</p>' +
            '</div>';
          return;
        }

        // errore: si resta sul modulo, i dati non si perdono
        ripristina();
        if (status) {
          status.className = 'form__status is-error';
          status.textContent = (esito.corpo && esito.corpo.errore)
            ? esito.corpo.errore
            : 'Non siamo riusciti a inviare la richiesta. Riprovate, oppure scriveteci a info@cantieresocial.com.';
        }
      })
      .catch(function () {
        ripristina();
        if (status) {
          status.className = 'form__status is-error';
          status.textContent = 'Connessione assente. Controllate la rete e riprovate, ' +
            'oppure scriveteci a info@cantieresocial.com.';
        }
      });
  });
})();
