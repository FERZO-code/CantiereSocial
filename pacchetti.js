/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — pagina /pacchetti
   1. Barra dei lotti: evidenzia la sezione in cui ci si trova.
   2. Servizi singoli: totale di partenza e consiglio sul pacchetto.
   La pagina funziona anche senza questo file.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.documentElement.classList.add('pk-js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── 1. Barra dei lotti ─────────────────────────────────────────── */
  var lista = document.querySelector('.pk-lotti__lista');
  var voci = lista ? Array.prototype.slice.call(lista.querySelectorAll('a')) : [];

  if (voci.length && 'IntersectionObserver' in window) {
    var visibili = {};

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visibili[e.target.id] = e.isIntersecting; });

      var attiva = null;
      voci.forEach(function (a) {
        if (!attiva && visibili[a.hash.slice(1)]) attiva = a;
      });

      voci.forEach(function (a) {
        if (a === attiva) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });

      // su telefono la barra scorre in orizzontale: la voce attiva resta visibile
      if (attiva && lista.scrollWidth > lista.clientWidth) {
        lista.scrollTo({ left: attiva.offsetLeft - 8, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }, { rootMargin: '-40% 0px -55% 0px' });

    voci.forEach(function (a) {
      var sezione = document.getElementById(a.hash.slice(1));
      if (sezione) io.observe(sezione);
    });
  }

  /* ── 2. Servizi singoli ─────────────────────────────────────────── */
  var form = document.getElementById('pk-config');
  if (!form) return;

  var caselle = Array.prototype.slice.call(form.querySelectorAll('input[name="servizi"]'));
  function q(attr) { return form.querySelector('[' + attr + ']'); }

  var vuoto = q('data-vuoto'), pieno = q('data-pieno'), conta = q('data-conta');
  var rigaUna = q('data-riga-una'), rigaMese = q('data-riga-mese');
  var valUna = q('data-una'), valMese = q('data-mese');
  var consiglio = q('data-consiglio'), invia = q('data-invia'), annuncio = q('data-annuncio');

  // "1200" → "€1.200" (Intl in italiano non mette il punto sulle migliaia a 4 cifre)
  function euro(n) { return '€' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  function nome(casella) {
    return casella.closest('.pk-serv').querySelector('.pk-serv__nome').textContent;
  }

  function aggiorna() {
    var scelte = {}, una = 0, mese = 0, nomi = [];

    caselle.forEach(function (c) {
      c.closest('.pk-serv').classList.toggle('is-scelto', c.checked);
      if (!c.checked) return;
      scelte[c.value] = true;
      nomi.push(nome(c));
      var prezzo = parseInt(c.getAttribute('data-prezzo'), 10) || 0;
      if (c.getAttribute('data-ricorrenza') === 'mese') mese += prezzo;
      else una += prezzo;
    });

    var n = nomi.length;
    vuoto.hidden = n > 0;
    pieno.hidden = n === 0;
    rigaUna.hidden = una === 0;
    rigaMese.hidden = mese === 0;
    valUna.textContent = euro(una);
    valMese.textContent = euro(mese);
    conta.textContent = n === 1 ? '1 servizio selezionato' : n + ' servizi selezionati';

    invia.textContent = n === 0 ? 'Richiedi un preventivo'
      : n === 1 ? 'Richiedi il preventivo per questo servizio'
      : 'Richiedi il preventivo per questi servizi';

    // quando la combinazione somiglia a un pacchetto, lo segnaliamo
    var testo = '';
    if (scelte.social && scelte.advertising) {
      testo = 'Social e advertising separati partono da €1.280/mese. Con €210 in più avete il ' +
              '<a href="#social">Pacchetto social</a>, che comprende anche strategia, produzione dei contenuti, ' +
              'drone e report mensile.';
    } else if (scelte.sito && (scelte.seo || scelte.advertising)) {
      testo = 'Con il <a href="#sito-web">Pacchetto sito web</a>, da €1.590 una tantum, ' +
              'sito, foto professionali, SEO e impostazione di Google Ads sono già compresi.';
    }
    consiglio.innerHTML = testo;
    consiglio.hidden = !testo;

    var parti = [];
    if (una) parti.push('da ' + euro(una) + ' una tantum');
    if (mese) parti.push('da ' + euro(mese) + ' al mese');
    annuncio.textContent = n ? (conta.textContent + ': ' + parti.join(' e ') + '.') : 'Nessun servizio selezionato.';
  }

  caselle.forEach(function (c) { c.addEventListener('change', aggiorna); });
  aggiorna();
  annuncio.textContent = '';   // niente annuncio al caricamento
})();
