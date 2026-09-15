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
  var DURATA = 2000;   // millisecondi

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
    var wide = window.matchMedia('(min-width: 1025px)');
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

  /* ── Il problema: racconto a scene ──────────────────────────────────
     La sezione è alta più schermi e il palco resta fermo: in base a quanto
     si è scorso si attiva una delle quattro scene.

     Perché non si saltino e non sembri di restare fermi:
     - ogni scena ha un punto di aggancio al suo centro (.racconto__tappe,
       vedi styles.css): uno scorrimento veloce si ferma alla scena dopo;
     - la barra dell'indice si riempie a ogni movimento e il telefono sale
       piano, così si vede sempre che si sta scendendo;
     - l'indice è cliccabile e porta dritti a una scena.
     Nessuno scorrimento forzato: decide sempre chi legge. */
  var racconto = document.querySelector('[data-racconto]');

  if (racconto) {
    var radice = document.documentElement;
    var sceneR = Array.prototype.slice.call(racconto.querySelectorAll('[data-scena]'));
    var vociR = Array.prototype.slice.call(racconto.querySelectorAll('[data-vai]'));
    var tappeR = Array.prototype.slice.call(racconto.querySelectorAll('.racconto__tappe i'));
    var nR = sceneR.length;
    var attualeR = -1;
    var inCodaR = false;

    var corsaR = function () { return racconto.offsetHeight - window.innerHeight; };

    // centro della scena k, in pixel dall'inizio della sezione
    var centroR = function (k) { return corsaR() * (k + 0.5) / nR; };

    // l'aggancio tiene conto di scroll-padding-top (spazio per la nav)
    var posizionaTappe = function () {
      var margine = parseFloat(getComputedStyle(radice).scrollPaddingTop) || 0;
      tappeR.forEach(function (t, k) { t.style.top = (centroR(k) + margine) + 'px'; });
    };

    var mostraScena = function (i) {
      if (i === attualeR) return;
      attualeR = i;
      racconto.setAttribute('data-attiva', String(i));
      sceneR.forEach(function (s, k) { s.classList.toggle('is-attiva', k === i); });
    };

    var calcolaScena = function () {
      inCodaR = false;
      var corsa = corsaR();
      var p = corsa > 0 ? Math.min(Math.max(-racconto.getBoundingClientRect().top / corsa, 0), 0.9999) : 0;
      var posizione = p * nR;
      var i = Math.floor(posizione);

      mostraScena(i);
      vociR.forEach(function (b, k) {
        var riempi = k < i ? 1 : (k === i ? posizione - i : 0);
        b.style.setProperty('--riempi', riempi.toFixed(3));
        b.classList.toggle('is-su', k <= i);
      });
      racconto.style.setProperty('--corsa', p.toFixed(3));
    };

    var chiediScena = function () {
      if (inCodaR) return;
      inCodaR = true;
      requestAnimationFrame(calcolaScena);
    };

    vociR.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = parseInt(b.getAttribute('data-vai'), 10);
        var inizio = racconto.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: inizio + centroR(k), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    });

    racconto.classList.add('racconto--attivo');
    radice.classList.add('aggancio-racconto');
    posizionaTappe();
    calcolaScena();
    window.addEventListener('scroll', chiediScena, { passive: true });
    window.addEventListener('resize', function () { posizionaTappe(); chiediScena(); });
  }

  /* ── Nav: evidenzia la sezione in vista ─────────────────────────── */
  var vociNav = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));

  if (vociNav.length && 'IntersectionObserver' in window) {
    var inVista = {};
    var spia = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inVista[e.target.id] = e.isIntersecting; });
      var attiva = null;
      vociNav.forEach(function (a) { if (!attiva && inVista[a.hash.slice(1)]) attiva = a; });
      vociNav.forEach(function (a) {
        if (a === attiva) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    vociNav.forEach(function (a) {
      var sezione = document.getElementById(a.hash.slice(1));
      if (sezione) spia.observe(sezione);
    });
  }

  /* ── Metodo: avanzamento lavori ─────────────────────────────────────
     La barra arancione scende lungo le fasi mentre si scorre e ogni fase
     si "accende" quando la si raggiunge. Con meno animazioni resta piena. */
  var cantiere = document.querySelector('[data-avanzamento]');

  if (cantiere && !reduceMotion.matches) {
    var fasi = Array.prototype.slice.call(cantiere.querySelectorAll('.phase'));
    var inCoda = false;

    var avanza = function () {
      inCoda = false;
      var linea = window.innerHeight * 0.62;       // la "quota" raggiunta
      var r = cantiere.getBoundingClientRect();
      var p = Math.min(Math.max((linea - r.top) / r.height, 0), 1);
      cantiere.style.setProperty('--avanzamento', p.toFixed(3));
      fasi.forEach(function (f) {
        f.classList.toggle('is-raggiunta', f.getBoundingClientRect().top + 36 < linea);
      });
    };
    var chiedi = function () {
      if (inCoda) return;
      inCoda = true;
      requestAnimationFrame(avanza);
    };

    cantiere.classList.add('avanzamento--attivo');
    avanza();
    window.addEventListener('scroll', chiedi, { passive: true });
    window.addEventListener('resize', chiedi);
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

  /* Richiesta precompilata: i pulsanti di /pacchetti portano qui con
     ?richiesta=… (e ?servizi=… per i servizi singoli). Solo valori noti:
     nulla di ciò che è nell'indirizzo finisce nel modulo così com'è. */
  (function precompila() {
    var msg = form.elements.messaggio;
    if (!msg || msg.value || !window.URLSearchParams) return;

    var q = new URLSearchParams(location.search);
    var RICHIESTE = {
      'sopralluogo':         'Vorrei prenotare il sopralluogo gratuito.',
      'commessa':            'Vorrei un preventivo per una commessa (video senza abbonamento).',
      'commessa-essenziale': 'Mi interessa il pacchetto Per commessa · Essenziale (1 video, €390).',
      'commessa-racconto':   'Mi interessa il pacchetto Per commessa · Racconto (2 video, €690).',
      'commessa-completa':   'Mi interessa il pacchetto Per commessa · Completa (4 video, €990).',
      'social':              'Mi interessa il Pacchetto social (da €1.490 al mese).',
      'sito-web':            'Mi interessa il Pacchetto sito web (da €1.590 una tantum).'
    };
    var SERVIZI = {
      produzione: 'Produzione contenuti', social: 'Social media management',
      advertising: 'Advertising', sito: 'Sito web', seo: 'SEO', brand: 'Brand identity'
    };

    var tipo = q.get('richiesta');
    var testo = RICHIESTE[tipo];

    if (tipo === 'servizi') {
      var nomi = q.getAll('servizi')
        .filter(function (s) { return SERVIZI.hasOwnProperty(s); })
        .map(function (s) { return SERVIZI[s]; });
      testo = nomi.length
        ? 'Vorrei un preventivo per: ' + nomi.join(', ') + '.'
        : 'Vorrei un preventivo per uno o più servizi singoli.';
    }

    if (testo) msg.value = testo + '\n\n';
  })();

  /* Scelte rapide "Cosa vi interessa": scrivono una riga in cima al
     messaggio, che si aggiorna a ogni scelta. Il resto del testo resta. */
  (function interessi() {
    var box = form.querySelector('.interessi');
    var msg = form.elements.messaggio;
    if (!box || !msg) return;

    box.hidden = false;
    var scelte = Array.prototype.slice.call(box.querySelectorAll('[data-interesse]'));
    var PREFISSO = 'Mi interessa: ';

    // arrivando da /pacchetti la scelta corrispondente è già segnata
    var richiesta = window.URLSearchParams ? (new URLSearchParams(location.search).get('richiesta') || '') : '';
    var preset = richiesta.indexOf('commessa') === 0 ? 'commessa'
      : ({ 'social': 'social', 'sito-web': 'sito', 'servizi': 'singoli' })[richiesta];

    scelte.forEach(function (b) {
      if (b.getAttribute('data-interesse') === preset) b.setAttribute('aria-pressed', 'true');

      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));

        var nomi = scelte
          .filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })
          .map(function (x) { return x.textContent.trim(); });

        var resto = msg.value.split('\n')
          .filter(function (riga) { return riga.indexOf(PREFISSO) !== 0; })
          .join('\n').replace(/^\n+/, '');

        msg.value = (nomi.length ? PREFISSO + nomi.join(', ') + '.\n' : '') + resto;
      });
    });
  })();

  // Istante di apertura: il server rifiuta gli invii troppo rapidi,
  // che nessun umano riesce a produrre compilando davvero i campi.
  var apertoIl = Date.now();

  var RULES = {
    nome:     { err: 'err-nome',     msg: 'Serve il nome per sapere con chi parliamo.' },
    email:    { err: 'err-email',    msg: 'Controllate l’indirizzo email: sembra incompleto.' },
    settore:  { err: 'err-settore',  msg: 'Scegliete di cosa vi occupate.' },
    privacy:  { err: 'err-privacy',  msg: 'Confermate di aver letto l’informativa privacy.' }
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
      ts:        apertoIl,                  // trappola temporale
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
          // conversione Google Ads: parte solo se c'è il consenso
          if (window.CantiereConsenso) window.CantiereConsenso.conversione('modulo');
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

/* ═══════════════════════════════════════════════════════════════════
   FINESTRA DI CONTATTO WHATSAPP — in basso a destra, su tutte le pagine
   Nessuno script né widget di WhatsApp: è un nostro pulsante che apre un
   link wa.me con un messaggio già scritto. A WhatsApp non arriva nulla
   finché la persona non apre la chat e preme invia.
   Il clic su "Apri la chat" viene contato come contatto WhatsApp da
   consenso.js, e solo con il consenso alle statistiche.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var NUMERO = '393474068285';
  var MESSAGGI = {
    edile:       "Ciao Cantiere Social, ho un'impresa edile e vorrei informazioni sui vostri pacchetti.",
    showroom:    "Ciao Cantiere Social, ho uno showroom e vorrei informazioni sui vostri pacchetti.",
    immobiliare: "Ciao Cantiere Social, ho un'agenzia immobiliare e vorrei informazioni sui vostri pacchetti.",
    altro:       "Ciao Cantiere Social, vorrei informazioni sui vostri servizi."
  };

  function link(tipo) {
    return 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(MESSAGGI[tipo] || MESSAGGI.altro);
  }

  var TRACCIATO_WA = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

  function logo(misura) {
    return '<svg viewBox="0 0 24 24" width="' + misura + '" height="' + misura + '" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="' + TRACCIATO_WA + '"/></svg>';
  }
  var CHIUDI = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var STELLA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 1.6l2.9 6.6 7.1.7-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 8.9l7.1-.7z"/></svg>';

  function scelta(tipo, testo) {
    return '<button type="button" class="wa__scelta" data-tipo="' + tipo + '" aria-pressed="false">' + testo + '</button>';
  }

  var wa = document.createElement('div');
  wa.className = 'wa';
  wa.innerHTML =
    '<div class="wa__pannello" id="wa-pannello" role="dialog" aria-modal="false" aria-labelledby="wa-titolo" hidden>' +
      '<div class="wa__testa">' +
        '<span class="wa__avatar">' + STELLA + '</span>' +
        '<div class="wa__chi">' +
          '<p class="wa__titolo" id="wa-titolo">Cantiere Social</p>' +
          '<p class="wa__stato">Simona e Ferdinando · rispondiamo entro un giorno lavorativo</p>' +
        '</div>' +
        '<button type="button" class="wa__chiudi" aria-label="Chiudi la finestra WhatsApp">' + CHIUDI + '</button>' +
      '</div>' +
      '<div class="wa__corpo">' +
        '<p class="wa__fumetto">Ciao, siamo Simona e Ferdinando. Di cosa vi occupate? ' +
          'Vi prepariamo il messaggio, poi lo inviate voi da WhatsApp.</p>' +
        '<div class="wa__scelte" role="group" aria-label="Di cosa vi occupate">' +
          scelta('edile', 'Impresa edile') +
          scelta('showroom', 'Showroom') +
          scelta('immobiliare', 'Agenzia immobiliare') +
          scelta('altro', 'Altro') +
        '</div>' +
        '<a class="wa__apri" href="' + link('altro') + '" target="_blank" rel="noopener">' +
          logo(20) + 'Apri la chat su WhatsApp</a>' +
        '<p class="wa__nota">Nulla parte finché non premete invia su WhatsApp.</p>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="wa__lancia" aria-expanded="false" aria-controls="wa-pannello" ' +
      'aria-label="Scriveteci su WhatsApp">' + logo(26) + '<span class="wa__etichetta">WhatsApp</span></button>';

  document.body.appendChild(wa);   // in fondo: ultimo nell'ordine di tabulazione

  var pannello = wa.querySelector('.wa__pannello');
  var lancia = wa.querySelector('.wa__lancia');
  var apri = wa.querySelector('.wa__apri');
  var scelte = wa.querySelectorAll('.wa__scelta');

  function apriPannello() {
    pannello.hidden = false;
    lancia.setAttribute('aria-expanded', 'true');
    wa.classList.add('is-aperta');
    scelte[0].focus();
  }

  function chiudiPannello(ridaiFocus) {
    if (pannello.hidden) return;
    pannello.hidden = true;
    lancia.setAttribute('aria-expanded', 'false');
    wa.classList.remove('is-aperta');
    if (ridaiFocus) lancia.focus();
  }

  lancia.addEventListener('click', function () {
    if (pannello.hidden) apriPannello();
    else chiudiPannello(true);
  });

  wa.querySelector('.wa__chiudi').addEventListener('click', function () { chiudiPannello(true); });

  // la scelta del settore riscrive il messaggio già pronto
  scelte.forEach(function (b) {
    b.addEventListener('click', function () {
      scelte.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apri.href = link(b.getAttribute('data-tipo'));
    });
  });

  // aperta la chat, la finestra si richiude da sola
  apri.addEventListener('click', function () {
    setTimeout(function () { chiudiPannello(false); }, 0);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pannello.hidden) chiudiPannello(wa.contains(document.activeElement));
  });

  document.addEventListener('click', function (e) {
    if (!pannello.hidden && !wa.contains(e.target)) chiudiPannello(false);
  });
})();
