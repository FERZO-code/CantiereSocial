/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — landing /offerta
   Modulo corto (nome + cellulare) verso /api/contact con tipo "offerta",
   lo stesso che riceve il pop-up. Più il conto alla rovescia.

   ⚠️ La data dell'offerta compare anche in script.js, nel pop-up e nella
   finestra WhatsApp: se la spostate, cambiatela in tutti i punti.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FINE = new Date('2026-10-01T23:59:59+02:00');
  var GIORNO = 86400000;

  var form = document.getElementById('of-form');
  if (!form) return;

  var stato = form.querySelector('.of-stato');
  var apertoIl = Date.now();
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── conto alla rovescia ─────────────────────────────────────────── */
  var scadenza = document.querySelector('[data-scadenza]');
  if (scadenza) {
    var ora = new Date();
    if (ora > FINE) {
      scadenza.textContent = 'Offerta conclusa · scriveteci per un preventivo';
    } else {
      var giorni = Math.ceil((FINE - ora) / GIORNO);
      scadenza.innerHTML = 'Fino al 1° ottobre · <strong>' +
        (giorni <= 1 ? 'ultimo giorno' : 'mancano ' + giorni + ' giorni') + '</strong>';
    }
  }

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
          encodeURIComponent('Ciao Cantiere Social, ho appena richiesto l\'offerta 3 video a €390.') +
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
