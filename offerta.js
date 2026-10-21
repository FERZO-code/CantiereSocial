/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — landing /offerta (sito web a €500)
   Modulo corto (nome + cellulare) verso /api/contact con tipo "offerta".

   Nessun conto alla rovescia: l'offerta non ha una scadenza. Se ne mettete
   una, rimettete il blocco "conto alla rovescia" (sta nella cronologia git,
   versione dei 3 video) e ricordatevi che la data va cambiata anche in
   script.js, dove vivono il pop-up e la finestra WhatsApp.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';


  /* ── PRENOTAZIONE CON STRIPE ───────────────────────────────────────
     Incolliamo qui il link di pagamento creato nel pannello Stripe
     (Pagamenti → Link di pagamento). Finché la riga resta vuota, i
     pulsanti «Prenota il posto» non compaiono: meglio nessun pulsante
     che un pulsante rotto.

     Nel pannello Stripe, sul link, impostate:
       · importo 50€ (IVA inclusa), descrizione "Prenotazione sito web"
       · dopo il pagamento → reindirizza a https://www.cantieresocial.com/grazie
       · raccolta dell'indirizzo email e del numero di telefono
     Non serve nessuna chiave segreta nel sito: il pagamento avviene
     su Stripe, noi mandiamo solo il visitatore. */
  var STRIPE_PRENOTAZIONE = 'https://buy.stripe.com/28E8wO12G02j5dq84If3a00';
  var PRENOTAZIONE_EURO   = 50;

  (function prenotazione() {
    var bottoni = document.querySelectorAll('[data-stripe]');
    var blocchi = document.querySelectorAll('[data-prenota]');
    var ok = /^https:\/\/(buy\.stripe\.com|[a-z0-9-]+\.stripe\.com)\//.test(STRIPE_PRENOTAZIONE);

    if (!ok) return;   // link non ancora configurato: i blocchi restano nascosti

    Array.prototype.forEach.call(bottoni, function (b) {
      b.href = STRIPE_PRENOTAZIONE;
      b.textContent = 'Prenota il posto · €' + PRENOTAZIONE_EURO;
    });
    Array.prototype.forEach.call(blocchi, function (b) { b.hidden = false; });
  })();

  /* ── POSTI DISPONIBILI ─────────────────────────────────────────────
     ⚠️ UNICO PUNTO DA AGGIORNARE: quando entra un cliente, calate
     POSTI_RIMASTI di uno. Il numero compare in tre punti della pagina
     (occhiello, cartello, chiusura) e nella pagina /link: li riempie
     questo blocco, non copiateli a mano.
     Tenetelo vero: un «9 rimanenti» fermo per tre mesi lo smaschera
     chiunque, e fa più danno che bene. */
  var POSTI_TOTALI  = 10;
  var POSTI_RIMASTI = 9;

  (function posti() {
    var n = Math.max(0, Math.min(POSTI_RIMASTI, POSTI_TOTALI));
    var presi = POSTI_TOTALI - n;

    var riga = document.querySelector('[data-posti]');
    if (riga) {
      riga.innerHTML = n === 0
        ? 'Posti esauriti · <strong>scriveteci per la prossima finestra</strong>'
        : 'Per i primi <b>' + POSTI_TOTALI + ' clienti</b> · <strong>' +
          (n === 1 ? 'ultimo posto' : n + ' rimanenti') + '</strong>';
    }

    var occhiello = document.querySelector('[data-posti-occhiello]');
    if (occhiello) occhiello.textContent = 'primi ' + POSTI_TOTALI + ' clienti';

    var finale = document.querySelector('[data-posti-finale]');
    if (finale) {
      finale.textContent = n === 0
        ? 'primi ' + POSTI_TOTALI + ' clienti: i posti sono esauriti'
        : 'primi ' + POSTI_TOTALI + ' clienti: ' +
          (n === 1 ? 'ne resta uno' : 'ne restano ' + n);
    }

    /* i lotti: un mattoncino per posto, quelli presi sono pieni */
    var lotti = document.querySelector('[data-lotti]');
    if (lotti) {
      var html = '';
      for (var i = 0; i < POSTI_TOTALI; i++) {
        html += '<span class="of-lotto' + (i < presi ? ' is-preso' : '') + '"></span>';
      }
      lotti.innerHTML = html;
      lotti.hidden = false;
    }
  })();

  var form = document.getElementById('of-form');
  if (!form) return;

  var stato = form.querySelector('.of-stato');
  var apertoIl = Date.now();
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── validazione (il server ricontrolla tutto) ───────────────────── */
  var CELLULARE_OK = /^(?:\+39|0039)?3\d{8,9}$/;
  var REGOLE = {
    nome: function (el) {
      return el.value.trim().length >= 2 ? '' : 'Scriveteci il nome, così sappiamo chi chiamare.';
    },
    telefono: function (el) {
      return CELLULARE_OK.test(el.value.replace(/[\s.\-()\/]/g, '')) ? ''
        : 'Controllate il numero: serve un cellulare italiano, per esempio 333 123 4567.';
    },
    privacy: function (el) {
      return el.checked ? '' : 'Confermate di aver letto l\'informativa privacy.';
    }
  };

  function controlla(nome) {
    var el = form.elements[nome];
    var box = document.getElementById('of-err-' + nome);
    var msg = REGOLE[nome](el);
    box.textContent = msg;
    box.hidden = !msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      el.setAttribute('aria-describedby', box.id);
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
    return !msg;
  }

  ['nome', 'telefono'].forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener('blur', function () { if (el.value) controlla(n); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) controlla(n); });
  });
  form.elements.privacy.addEventListener('change', function () {
    if (form.elements.privacy.getAttribute('aria-invalid')) controlla('privacy');
  });

  /* ── invio ───────────────────────────────────────────────────────── */
  function conferma(nome) {
    var corpo = form.parentNode;
    corpo.innerHTML =
      '<div class="of-fatto" role="status">' +
        '<p class="of-fatto-t">Richiesta inviata</p>' +
        '<p data-grazie></p>' +
        '<a class="of-wa" href="https://wa.me/393474068285?text=' +
          encodeURIComponent('Ciao Cantiere Social, ho appena richiesto il sito a 500€.') +
          '" target="_blank" rel="noopener">Se avete fretta, scriveteci su WhatsApp</a>' +
      '</div>';
    corpo.querySelector('[data-grazie]').textContent =
      'Grazie ' + nome + ', vi richiamiamo entro un giorno lavorativo.';
    corpo.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    stato.textContent = '';

    var primo = null;
    ['nome', 'telefono', 'privacy'].forEach(function (n) {
      if (!controlla(n) && !primo) primo = form.elements[n];
    });
    if (primo) { primo.focus(); return; }

    var bottone = form.querySelector('button[type="submit"]');
    var testo = bottone.textContent;
    var nome = form.elements.nome.value.trim();
    bottone.disabled = true;
    bottone.textContent = 'Invio in corso…';

    function ripristina(messaggio) {
      bottone.disabled = false;
      bottone.textContent = testo;
      stato.textContent = messaggio;
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'offerta',
        nome: nome,
        telefono: form.elements.telefono.value.trim(),
        privacy: true,
        website: form.elements.website.value,          // trappola anti-spam
        ts: apertoIl,                                  // trappola temporale
        // pathname + eventuali utm dell'inserzione, per sapere da dove arriva
        pagina: (location.pathname + location.search).slice(0, 100)
      })
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (c) { return { ok: r.ok, corpo: c }; });
      })
      .then(function (esito) {
        if (esito.ok && esito.corpo.ok) {
          conferma(nome);
          // conversione Google Ads / Analytics: parte solo con il consenso
          if (window.CantiereConsenso) window.CantiereConsenso.conversione('modulo');
          return;
        }
        ripristina((esito.corpo && esito.corpo.errore) ||
          'Non siamo riusciti a inviare la richiesta. Riprovate, oppure scriveteci su WhatsApp.');
      })
      .catch(function () {
        ripristina('Connessione assente. Controllate la rete e riprovate.');
      });
  });
})();

/* ── video di presentazione (VSL) ────────────────────────────────────
   Niente autoplay: parte al tocco, con l'audio e i controlli nativi.
   preload="none" nell'HTML: i 6 MB si scaricano solo se lo si guarda.
   Con il consenso alle statistiche, Analytics riceve inizio, metà e fine
   (gtag esiste solo dopo il consenso, vedi consenso.js). */
(function () {
  'use strict';

  var box = document.querySelector('[data-vsl]');
  if (!box) return;
  var video = box.querySelector('video');
  var play = box.querySelector('[data-vsl-play]');
  var inviati = {};

  function evento(nome) {
    if (inviati[nome] || typeof window.gtag !== 'function') return;
    inviati[nome] = true;
    window.gtag('event', nome, { video_title: 'VSL sito 490' });
  }

  play.addEventListener('click', function () {
    box.classList.add('is-avviato');
    video.controls = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* bloccato dal browser: restano i controlli */ });
    video.focus();
  });

  video.addEventListener('play', function () { evento('vsl_inizio'); });
  video.addEventListener('timeupdate', function () {
    if (video.duration && video.currentTime / video.duration >= 0.5) evento('vsl_meta');
  });
  video.addEventListener('ended', function () {
    evento('vsl_fine');
    // finito il video, il passo successivo è il cartello con il prezzo
    var modulo = document.getElementById('modulo');
    if (modulo && modulo.getBoundingClientRect().top > window.innerHeight * 0.6) {
      modulo.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
})();
