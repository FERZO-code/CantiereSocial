/* ═══════════════════════════════════════════════════════════════════
   POST /api/contact
   Riceve il modulo e lo inoltra via Resend a info@cantieresocial.com.

   Gira su Vercel come funzione serverless. Nessuna dipendenza npm:
   usa la fetch incorporata in Node 18+.

   Variabili d'ambiente richieste (Vercel → Settings → Environment Variables):
     RESEND_API_KEY   la chiave di Resend            (obbligatoria, SEGRETA)
                      accettato anche il nome RESEND_KEY
     MAIL_TO          destinatario                   (default: info@cantieresocial.com)
     MAIL_FROM        mittente verificato su Resend  (default: sito@send.cantieresocial.com)

   ⚠️ La chiave sta SOLO qui, lato server. Non finisce mai nel codice
      che il browser scarica.
   ═══════════════════════════════════════════════════════════════════ */

/* ═══ LIMITATORE DI FREQUENZA ═══════════════════════════════════════
   Memoria dell'istanza: le funzioni Vercel sono senza stato e replicate,
   quindi questo conteggio è "al meglio delle possibilità", non una
   garanzia. Ferma comunque bot ingenui, doppi clic e invii ripetuti,
   che è il 99% di ciò che arriva a un form di contatto.

   Il tetto globale serve a proteggere la vostra quota Resend: senza,
   un attacco potrebbe bruciare le 3.000 email mensili in un pomeriggio.

   Se un giorno subirete abusi veri, il passo successivo è uno store
   condiviso (Upstash Redis via API REST). Vedi LEGGIMI.md.
   ═══════════════════════════════════════════════════════════════════ */

const FINESTRA_MS   = 10 * 60 * 1000;  // 10 minuti
const MAX_PER_IP    = 3;               // invii per IP nella finestra
const MAX_GLOBALE   = 20;              // invii totali nella finestra
const MAX_IP_TENUTI = 5000;            // tetto anti-crescita della mappa
const ATTESA_MINIMA = 3000;            // ms minimi per compilare il modulo

const perIp = new Map();   // ip -> [timestamp, ...]
let globale = [];          // [timestamp, ...]

function recenti(lista, ora) {
  return lista.filter(function (t) { return ora - t < FINESTRA_MS; });
}

function ipRichiesta(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.headers['x-real-ip'] || 'sconosciuto';
}

/* Sola lettura: dice se l'IP è già oltre il limite, senza consumare nulla. */
function controllaLimite(ip) {
  const ora = Date.now();

  globale = recenti(globale, ora);
  if (globale.length >= MAX_GLOBALE) {
    return { bloccato: true, motivo: 'globale', attesa: Math.ceil(FINESTRA_MS / 1000) };
  }

  // pulizia: senza, la mappa cresce all'infinito finché l'istanza vive
  if (perIp.size > MAX_IP_TENUTI) {
    for (const [k, v] of perIp) {
      if (recenti(v, ora).length === 0) perIp.delete(k);
    }
  }

  const suoi = recenti(perIp.get(ip) || [], ora);
  if (suoi.length) perIp.set(ip, suoi);

  if (suoi.length >= MAX_PER_IP) {
    const piuVecchio = Math.min.apply(null, suoi);
    const attesa = Math.ceil((FINESTRA_MS - (ora - piuVecchio)) / 1000);
    return { bloccato: true, motivo: 'ip', attesa: Math.max(attesa, 1) };
  }

  return { bloccato: false };
}

/* Registra un invio riuscito. Chiamata SOLO subito prima di spedire:
   così chi sbaglia a compilare non brucia i propri tentativi. */
function registraInvio(ip) {
  const ora = Date.now();
  const suoi = recenti(perIp.get(ip) || [], ora);
  suoi.push(ora);
  perIp.set(ip, suoi);
  globale.push(ora);
}

/* Accetta entrambi i nomi: è facilissimo scrivere l'uno pensando all'altro,
   e il sintomo (form muto) non fa capire dove sia il problema. */
const CHIAVE = process.env.RESEND_API_KEY || process.env.RESEND_KEY;

const DESTINATARIO = process.env.MAIL_TO   || 'info@cantieresocial.com';
const MITTENTE     = process.env.MAIL_FROM || 'Sito Cantiere Social <sito@send.cantieresocial.com>';

const SETTORI = ['Impresa di costruzione', 'Showroom', 'Agenzia immobiliare', 'Altro'];

/* Neutralizza l'HTML: il contenuto arriva da estranei e finisce
   dentro un'email in HTML. Senza questo, chiunque potrebbe iniettare
   markup o link nel messaggio che ricevete. */
function pulisci(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, errore: 'Metodo non consentito.' });
  }

  if (!CHIAVE) {
    console.error('Chiave Resend assente: né RESEND_API_KEY né RESEND_KEY sono impostate');
    return res.status(500).json({ ok: false, errore: 'Servizio email non configurato.' });
  }

  /* Controllo di frequenza, in sola lettura: respinge le raffiche prima
     di fare qualsiasi altro lavoro. Non consuma tentativi. */
  const ip = ipRichiesta(req);
  const limite = controllaLimite(ip);
  if (limite.bloccato) {
    res.setHeader('Retry-After', String(limite.attesa));
    return res.status(429).json({
      ok: false,
      attesa: limite.attesa,
      errore: limite.motivo === 'globale'
        ? 'Il modulo sta ricevendo troppe richieste in questo momento. Riprovate tra qualche minuto o scriveteci direttamente.'
        : 'Avete già inviato alcune richieste. Attendete qualche minuto prima di riprovare, oppure scriveteci direttamente.'
    });
  }

  let d = req.body;
  if (typeof d === 'string') {
    try { d = JSON.parse(d); } catch (e) {
      return res.status(400).json({ ok: false, errore: 'Dati non leggibili.' });
    }
  }
  if (!d || typeof d !== 'object') {
    return res.status(400).json({ ok: false, errore: 'Dati mancanti.' });
  }

  /* Trappola anti-spam: campo invisibile agli umani. Se è pieno è un bot.
     Rispondiamo ok per non insegnargli come aggirarla. */
  if (d.website) return res.status(200).json({ ok: true });

  /* Trappola temporale: un umano non compila sei campi in meno di 3 secondi.
     Filtra i compilatori automatici; non è una barriera crittografica,
     ma costa nulla e taglia gran parte del rumore. */
  const apertura = Number(d.ts);
  if (apertura && Date.now() - apertura < ATTESA_MINIMA) {
    return res.status(200).json({ ok: true });
  }

  /* ── Validazione lato server. Quella nel browser è comodità per
     l'utente, non sicurezza: si aggira in dieci secondi. ── */
  const nome     = String(d.nome     || '').trim();
  const email    = String(d.email    || '').trim();
  const settore  = String(d.settore  || '').trim();
  const azienda  = String(d.azienda  || '').trim();
  const telefono = String(d.telefono || '').trim();
  const messaggio= String(d.messaggio|| '').trim();

  const errori = [];
  if (nome.length < 2 || nome.length > 100)        errori.push('nome');
  if (!EMAIL_OK.test(email) || email.length > 200) errori.push('email');
  if (!SETTORI.includes(settore))                  errori.push('settore');
  if (d.privacy !== true)                          errori.push('privacy');
  if (messaggio.length > 5000)                     errori.push('messaggio');

  if (errori.length) {
    return res.status(400).json({ ok: false, errore: 'Alcuni campi non sono validi.', campi: errori });
  }

  const righe = [
    ['Nome',     nome],
    ['Azienda',  azienda  || '—'],
    ['Email',    email],
    ['Telefono', telefono || '—'],
    ['Settore',  settore]
  ].map(function (r) {
    return '<tr>'
      + '<td style="padding:6px 16px 6px 0;color:#6B5B4E;white-space:nowrap">' + r[0] + '</td>'
      + '<td style="padding:6px 0;color:#17120E;font-weight:600">' + pulisci(r[1]) + '</td>'
      + '</tr>';
  }).join('');

  const html = ''
    + '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;'
    +   'background:#FFF8F3;padding:28px;border-radius:14px">'
    +   '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;'
    +     'color:#A94B0B">Nuova richiesta dal sito</p>'
    +   '<h1 style="margin:0 0 22px;font-size:22px;color:#17120E">Sopralluogo richiesto</h1>'
    +   '<table style="border-collapse:collapse;font-size:15px">' + righe + '</table>'
    +   '<p style="margin:22px 0 6px;color:#6B5B4E;font-size:13px">Messaggio</p>'
    +   '<div style="background:#fff;border-left:3px solid #EA7621;padding:14px 16px;'
    +     'border-radius:8px;font-size:15px;color:#17120E;white-space:pre-wrap">'
    +     (pulisci(messaggio) || '<em style="color:#8C7A6B">nessun messaggio</em>')
    +   '</div>'
    +   '<p style="margin:22px 0 0;font-size:12px;color:#8C7A6B">'
    +     'Rispondendo a questa email scrivete direttamente a ' + pulisci(email) + '.'
    +   '</p>'
    + '</div>';

  const testo = 'Nuova richiesta dal sito\n\n'
    + 'Nome: ' + nome + '\nAzienda: ' + (azienda || '-') + '\nEmail: ' + email
    + '\nTelefono: ' + (telefono || '-') + '\nSettore: ' + settore
    + '\n\nMessaggio:\n' + (messaggio || '-');

  // da qui in poi si spedisce davvero: ora il tentativo conta
  registraInvio(ip);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CHIAVE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: MITTENTE,
        to: [DESTINATARIO],
        reply_to: email,        // "Rispondi" in Gmail scrive al cliente
        subject: 'Sopralluogo — ' + nome + (azienda ? ' (' + azienda + ')' : ''),
        html: html,
        text: testo
      })
    });

    if (!r.ok) {
      const dettaglio = await r.text();
      console.error('Resend ha risposto', r.status, dettaglio);
      return res.status(502).json({ ok: false, errore: 'Invio non riuscito. Riprovate tra poco.' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Errore di rete verso Resend:', err);
    return res.status(502).json({ ok: false, errore: 'Invio non riuscito. Riprovate tra poco.' });
  }
};
