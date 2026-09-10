/* ═══════════════════════════════════════════════════════════════════
   CANTIERE SOCIAL — consenso ai cookie, Google Analytics e Google Ads
   Nessuna dipendenza esterna.

   Come funziona (Consent Mode di Google, modalità "base"):
   - Finché non c'è il consenso, il tag di Google NON viene caricato:
     nessun cookie di Analytics o di Ads, nessuna richiesta a Google.
   - Due categorie separate, come chiede il Garante:
       Statistiche → Google Analytics 4   (analytics_storage)
       Pubblicità  → Google Ads           (ad_storage, ad_user_data)
     Nel banner compaiono solo quelle con un ID compilato qui sotto.
   - ad_personalization resta sempre negato e Google Signals è spento:
     niente remarketing.
   - "Rifiuta" e la × non caricano nulla. Scorrere la pagina non vale
     come consenso.
   - La scelta resta nel browser per 6 mesi (Linee guida del Garante,
     10 giugno 2021), poi viene richiesta di nuovo.
   - "Preferenze cookie" in fondo alle pagine riapre le scelte; revocando
     il consenso i relativi cookie vengono cancellati.

   ⚠️ NON incollate nelle pagine lo snippet "Google tag (gtag.js)" che
   fornisce Google: caricherebbe il tag PRIMA del consenso. Basta
   inserire gli ID qui sotto.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Configurazione (vedi LEGGIMI.md) ───────────────────────────── */
  var GA4_ID             = 'G-Y99687KHVT';   // Google Analytics 4
  var GOOGLE_ADS_ID      = 'AW-XXXXXXXXXX';  // ⚠️ DA COMPILARE, es. AW-123456789
  var ETICHETTA_MODULO   = '';               // Google Ads: la parte dopo "/" in send_to
  var ETICHETTA_WHATSAPP = '';

  /* Alzate VERSIONE quando cambiano cookie, fornitori o finalità:
     il banner ricomparirà a tutti, come richiesto dal Garante. */
  var VERSIONE  = 1;
  var CHIAVE    = 'cs_consenso';
  var DURATA_MS = 180 * 24 * 60 * 60 * 1000;   // 6 mesi

  // Solo per test/consenso-prova.html, che non viene pubblicata.
  var prova = window.CS_CONSENSO_PROVA;
  if (prova) {
    if ('ga4' in prova) GA4_ID = prova.ga4;
    if ('ads' in prova) GOOGLE_ADS_ID = prova.ads;
    if ('modulo' in prova) ETICHETTA_MODULO = prova.modulo;
    if ('whatsapp' in prova) ETICHETTA_WHATSAPP = prova.whatsapp;
  }

  var HA_STAT = /^G-[A-Z0-9]{6,}$/.test(GA4_ID);
  var HA_PUB  = /^AW-\d{6,}$/.test(GOOGLE_ADS_ID);

  var tagCaricato = false;
  var statAttive = false;
  var pubAttiva = false;

  // interfaccia usata da script.js; inerte finché nessun ID è configurato
  window.CantiereConsenso = { apri: function () {}, conversione: function () {}, stato: leggi };

  if (!HA_STAT && !HA_PUB) return;

  /* ── Memoria della scelta ─────────────────────────────────────────── */
  function leggi() {
    try {
      var v = JSON.parse(localStorage.getItem(CHIAVE));
      if (!v || v.versione !== VERSIONE || Date.now() - v.data > DURATA_MS) return null;
      return v;
    } catch (e) {
      return null;
    }
  }

  function salva(statistiche, pubblicita) {
    var v = {
      versione: VERSIONE,
      statistiche: HA_STAT && statistiche === true,
      pubblicita: HA_PUB && pubblicita === true,
      data: Date.now()
    };
    try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch (e) {}
    return v;
  }

  /* ── Tag Google (un solo gtag.js per Analytics e Ads) ─────────────── */
  function caricaTag(scelta) {
    var stat = HA_STAT && scelta.statistiche === true;
    var pub  = HA_PUB && scelta.pubblicita === true;
    if (tagCaricato || (!stat && !pub)) return;

    tagCaricato = true;
    statAttive = stat;
    pubAttiva = pub;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    // Di base tutto negato; poi si concede solo ciò che è stato accettato.
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: stat ? 'granted' : 'denied',
      ad_storage: pub ? 'granted' : 'denied',
      ad_user_data: pub ? 'granted' : 'denied'
    });
    window.gtag('js', new Date());

    if (stat) {
      window.gtag('config', GA4_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    }
    if (pub) window.gtag('config', GOOGLE_ADS_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(stat ? GA4_ID : GOOGLE_ADS_ID);
    document.head.appendChild(s);
  }

  function cancellaCookie(regola) {
    var host = location.hostname;
    var domini = ['', host, '.' + host];
    var parti = host.split('.');
    if (parti.length > 2) domini.push('.' + parti.slice(-2).join('.'));

    document.cookie.split(';').forEach(function (c) {
      var nome = c.split('=')[0].trim();
      if (!regola.test(nome)) return;
      domini.forEach(function (d) {
        document.cookie = nome + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }
  var COOKIE_STAT = /^(_ga|_gid)/;
  var COOKIE_PUB  = /^(_gcl|FPGCL|FPAU)/;

  /* Contatti: evento su Analytics e conversione su Ads, se acconsentiti. */
  function conversione(tipo) {
    if (!tagCaricato) return;
    if (statAttive) {
      if (tipo === 'modulo') window.gtag('event', 'generate_lead', { metodo: 'modulo' });
      if (tipo === 'whatsapp') window.gtag('event', 'clic_whatsapp');
    }
    var etichetta = tipo === 'modulo' ? ETICHETTA_MODULO
                  : tipo === 'whatsapp' ? ETICHETTA_WHATSAPP : '';
    if (pubAttiva && etichetta) {
      window.gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + etichetta });
    }
  }

  function applica(statistiche, pubblicita) {
    var nuova = salva(statistiche, pubblicita);
    nascondiBanner();

    if (!nuova.statistiche) cancellaCookie(COOKIE_STAT);
    if (!nuova.pubblicita) cancellaCookie(COOKIE_PUB);

    if (!tagCaricato) {
      caricaTag(nuova);
      return;
    }
    // Il tag è già in esecuzione con altre scelte: si riparte da una pagina pulita.
    if (nuova.statistiche !== statAttive || nuova.pubblicita !== pubAttiva) {
      window.gtag('consent', 'update', {
        analytics_storage: nuova.statistiche ? 'granted' : 'denied',
        ad_storage: nuova.pubblicita ? 'granted' : 'denied',
        ad_user_data: nuova.pubblicita ? 'granted' : 'denied'
      });
      location.reload();
    }
  }

  /* ── Interfaccia ──────────────────────────────────────────────────── */
  var ICONA_X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">' +
    '<path d="M6 6l12 12M18 6L6 18"/></svg>';

  var usi = [];
  if (HA_STAT) usi.push('di Google Analytics, per capire come viene usato il sito');
  if (HA_PUB) usi.push('di Google Ads, per misurare i nostri annunci');
  var frase = 'Usiamo cookie ' + usi.join(', e ') + '. Li attiviamo solo con il vostro consenso: ' +
    'se rifiutate, il sito funziona esattamente allo stesso modo.';

  var banner = document.createElement('section');
  banner.className = 'consenso';
  banner.setAttribute('aria-labelledby', 'consenso-t');
  banner.hidden = true;
  banner.innerHTML =
    '<div class="consenso__box">' +
      '<button type="button" class="consenso__chiudi" data-azione="rifiuta" ' +
        'aria-label="Chiudi e rifiuta i cookie non necessari">' + ICONA_X + '</button>' +
      '<p class="consenso__t" id="consenso-t">Cookie</p>' +
      '<p class="consenso__testo">' + frase + ' <a href="/cookie">Cookie policy</a></p>' +
      '<div class="consenso__azioni">' +
        '<button type="button" class="btn btn--light" data-azione="rifiuta">Rifiuta</button>' +
        '<button type="button" class="btn btn--light" data-azione="accetta">Accetta</button>' +
        '<button type="button" class="btn btn--line-inv" data-azione="personalizza">Personalizza</button>' +
      '</div>' +
    '</div>';

  function voce(id, nome, descrizione) {
    return '<div class="consenso-pref__voce">' +
      '<div><label class="consenso-pref__nome" for="' + id + '">' + nome + '</label>' +
      '<p class="consenso-pref__desc" id="' + id + '-desc">' + descrizione + '</p></div>' +
      '<input type="checkbox" class="consenso-switch" id="' + id + '" role="switch" ' +
        'aria-describedby="' + id + '-desc">' +
    '</div>';
  }

  var dialogo = document.createElement('dialog');
  dialogo.className = 'consenso-pref';
  dialogo.setAttribute('aria-labelledby', 'consenso-pref-t');
  dialogo.innerHTML =
    '<div class="consenso-pref__corpo">' +
      '<button type="button" class="consenso-pref__chiudi" data-azione="chiudi" ' +
        'aria-label="Chiudi senza modificare">' + ICONA_X + '</button>' +
      '<h2 class="consenso-pref__t" id="consenso-pref-t">Preferenze sui cookie</h2>' +
      '<p class="consenso-pref__intro">Scegliete cosa attivare. Potete cambiare idea in qualsiasi ' +
        'momento da «Preferenze cookie», in fondo a ogni pagina.</p>' +
      '<div class="consenso-pref__voce">' +
        '<div><p class="consenso-pref__nome">Necessari</p>' +
        '<p class="consenso-pref__desc">Ricordano la vostra scelta sui cookie. Senza, il banner ' +
          'ricomparirebbe a ogni pagina.</p></div>' +
        '<span class="consenso-pref__sempre">Sempre attivi</span>' +
      '</div>' +
      (HA_STAT ? voce('consenso-statistiche', 'Statistiche',
        'Google Analytics: quali pagine vengono visitate e come si arriva a contattarci. ' +
        'Dati consultati in forma aggregata, senza Google Signals.') : '') +
      (HA_PUB ? voce('consenso-pubblicita', 'Pubblicità e misurazione',
        'Google Ads: capire se chi arriva da un nostro annuncio poi ci contatta. Nessun remarketing.') : '') +
      '<div class="consenso-pref__azioni">' +
        '<button type="button" class="btn btn--dark" data-azione="rifiuta">Rifiuta tutto</button>' +
        '<button type="button" class="btn btn--dark" data-azione="accetta">Accetta tutto</button>' +
        '<button type="button" class="btn btn--ghost" data-azione="salva">Salva le scelte</button>' +
      '</div>' +
    '</div>';

  var interStat = dialogo.querySelector('#consenso-statistiche');
  var interPub = dialogo.querySelector('#consenso-pubblicita');
  var ultimoFocus = null;

  function apri() {
    var s = leggi();
    if (interStat) interStat.checked = !!(s && s.statistiche);
    if (interPub) interPub.checked = !!(s && s.pubblicita);
    ultimoFocus = document.activeElement;
    if (typeof dialogo.showModal === 'function') {
      if (!dialogo.open) dialogo.showModal();
    } else {
      dialogo.setAttribute('open', '');
    }
  }

  function chiudiDialogo() {
    if (!dialogo.open) return;
    if (typeof dialogo.close === 'function') dialogo.close();
    else dialogo.removeAttribute('open');
  }

  dialogo.addEventListener('close', function () {
    if (ultimoFocus && document.contains(ultimoFocus) && ultimoFocus.focus) ultimoFocus.focus();
  });

  function mostraBanner() {
    banner.hidden = false;
    document.body.classList.add('consenso-aperto');
    aggiornaSpazio();
  }

  function nascondiBanner() {
    banner.hidden = true;
    document.body.classList.remove('consenso-aperto');
    document.documentElement.style.removeProperty('--consenso-h');
  }

  // spazio in fondo alla pagina, così il banner non copre il footer
  function aggiornaSpazio() {
    if (banner.hidden) return;
    document.documentElement.style.setProperty('--consenso-h', (banner.offsetHeight + 24) + 'px');
  }

  function azione(e) {
    var btn = e.target.closest('[data-azione]');
    if (!btn) return;
    var a = btn.getAttribute('data-azione');
    if (a === 'accetta')           { chiudiDialogo(); applica(true, true); }
    else if (a === 'rifiuta')      { chiudiDialogo(); applica(false, false); }
    else if (a === 'salva')        { chiudiDialogo(); applica(!!(interStat && interStat.checked), !!(interPub && interPub.checked)); }
    else if (a === 'personalizza') { apri(); }
    else if (a === 'chiudi')       { chiudiDialogo(); }
  }

  // aspetta la fine dell'intro, per non comparire sopra l'animazione
  function quandoIntroFinisce(fn) {
    var root = document.documentElement;
    if (!root.classList.contains('intro-on')) return fn();
    var oss = new MutationObserver(function () {
      if (!root.classList.contains('intro-on')) { oss.disconnect(); fn(); }
    });
    oss.observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  banner.addEventListener('click', azione);
  dialogo.addEventListener('click', azione);

  if ('ResizeObserver' in window) new ResizeObserver(aggiornaSpazio).observe(banner);
  else window.addEventListener('resize', aggiornaSpazio);

  // il banner subito dopo il link "Vai al contenuto": primo nell'ordine di tabulazione
  var salto = document.querySelector('.skip-link');
  if (salto && salto.parentNode === document.body) document.body.insertBefore(banner, salto.nextSibling);
  else document.body.insertBefore(banner, document.body.firstChild);
  document.body.appendChild(dialogo);

  // "Preferenze cookie": nascosto finché questo file non è attivo
  document.querySelectorAll('[data-consenso-apri], [data-consenso-sep]').forEach(function (el) {
    el.hidden = false;
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consenso-apri]')) { e.preventDefault(); apri(); return; }
    if (e.target.closest('a[href*="wa.me/"]')) conversione('whatsapp');
  });

  var scelta = leggi();
  if (scelta) caricaTag(scelta);
  else quandoIntroFinisce(mostraBanner);

  window.CantiereConsenso = { apri: apri, conversione: conversione, stato: leggi };
})();
