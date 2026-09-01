/* ═══════════════════════════════════════════════════════════════════
   GET /api/diagnostica?k=cantiere

   File TEMPORANEO per capire perché la chiave non arriva alla funzione.
   ⚠️ CANCELLATELO appena il form funziona.

   Non mostra MAI il valore delle variabili: solo i NOMI presenti e
   qualche controllo di forma. La chiave non esce di qui.
   ═══════════════════════════════════════════════════════════════════ */

module.exports = function handler(req, res) {
  if (req.query.k !== 'cantiere') {
    return res.status(404).json({ errore: 'Non trovato.' });
  }

  var chiave = process.env.RESEND_API_KEY || process.env.RESEND_KEY;

  // nomi (non valori) delle variabili che ci interessano
  var nomiPertinenti = Object.keys(process.env)
    .filter(function (n) { return /RESEND|MAIL|SMTP|EMAIL/i.test(n); })
    .sort();

  res.status(200).json({
    progetto: process.env.VERCEL_PROJECT_NAME || '(non esposto)',
    ambiente: process.env.VERCEL_ENV || '(sconosciuto)',
    urlDeploy: process.env.VERCEL_URL || '(sconosciuto)',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || '(nessun git)',

    chiave: {
      nomeUsato: process.env.RESEND_API_KEY ? 'RESEND_API_KEY'
               : (process.env.RESEND_KEY ? 'RESEND_KEY' : '(nessuna)'),
      presente: !!chiave,
      lunghezza: chiave ? chiave.length : 0,
      iniziaConRe_: chiave ? chiave.indexOf('re_') === 0 : false,
      haSpaziOApici: chiave ? /^\s|\s$|^["']|["']$/.test(chiave) : false
    },

    mailTo:   process.env.MAIL_TO   ? 'impostata' : 'non impostata (userà il default)',
    mailFrom: process.env.MAIL_FROM ? 'impostata' : 'non impostata (userà il default)',

    variabiliTrovate: nomiPertinenti.length ? nomiPertinenti : '(nessuna variabile con RESEND/MAIL/EMAIL nel nome)',
    totaleVariabili: Object.keys(process.env).length
  });
};
