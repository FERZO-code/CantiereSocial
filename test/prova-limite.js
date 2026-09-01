process.env.RESEND_KEY = 're_finta_chiave_di_prova';

let emailSpedite = 0;
global.fetch = async () => { emailSpedite++; return { ok: true, text: async () => '' }; };

const handler = require('../api/contact.js');

function finge(corpo, ip = '1.2.3.4') {
  const req = { method: 'POST', headers: { 'x-forwarded-for': ip }, body: corpo };
  let esito = {};
  const res = {
    setHeader() {},
    status(c) { esito.status = c; return this; },
    json(b) { esito.body = b; return this; }
  };
  return handler(req, res).then(() => esito);
}

const valido = (n = 'Mario Rossi') => ({
  nome: n, email: 'mario@example.com', settore: 'Altro', privacy: true,
  messaggio: 'prova', ts: Date.now() - 10000
});

(async () => {
  let ok = true;
  const dice = (t, c) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) ok = false; };

  console.log('\n— Limite per IP (max 3 in 10 minuti) —');
  for (let i = 1; i <= 3; i++) {
    const r = await finge(valido(), '10.0.0.1');
    dice(`invio ${i} accettato (200)`, r.status === 200 && r.body.ok === true);
  }
  const quarto = await finge(valido(), '10.0.0.1');
  dice('4º invio respinto con 429', quarto.status === 429);
  dice('la risposta indica quanto attendere', typeof quarto.body.attesa === 'number' && quarto.body.attesa > 0);

  console.log('\n— Un IP diverso non è toccato —');
  const altro = await finge(valido(), '10.0.0.2');
  dice('IP diverso accettato', altro.status === 200);

  console.log('\n— Gli errori di compilazione NON bruciano tentativi —');
  const ipC = '10.0.0.3';
  for (let i = 0; i < 5; i++) {
    await finge({ ...valido(), email: 'non-una-email' }, ipC);
  }
  const dopoErrori = await finge(valido(), ipC);
  dice('dopo 5 tentativi invalidi si può ancora inviare', dopoErrori.status === 200);

  console.log('\n— Trappola anti-spam —');
  const primaBot = emailSpedite;
  const bot = await finge({ ...valido(), website: 'http://spam' }, '10.0.0.4');
  dice('honeypot: risponde 200 (non insegna al bot)', bot.status === 200);
  dice('honeypot: nessuna email spedita', emailSpedite === primaBot);

  console.log('\n— Trappola temporale —');
  const primaVeloce = emailSpedite;
  const veloce = await finge({ ...valido(), ts: Date.now() - 500 }, '10.0.0.5');
  dice('invio in 0,5 s scartato senza spedire', veloce.status === 200 && emailSpedite === primaVeloce);
  const lento = await finge({ ...valido(), ts: Date.now() - 8000 }, '10.0.0.6');
  dice('invio dopo 8 s accettato', lento.status === 200 && lento.body.ok === true);

  console.log('\n— Tetto globale (protegge la quota Resend) —');
  let bloccoGlobale = false;
  for (let i = 0; i < 40 && !bloccoGlobale; i++) {
    const r = await finge(valido(), '172.16.0.' + i);
    if (r.status === 429 && r.body.errore.includes('troppe richieste')) bloccoGlobale = true;
  }
  dice('il tetto globale scatta', bloccoGlobale);

  console.log(`\nEmail realmente "spedite" nel test: ${emailSpedite}`);
  console.log(ok ? '\n✅ TUTTI I CONTROLLI SUPERATI\n' : '\n❌ QUALCOSA NON VA\n');
  process.exit(ok ? 0 : 1);
})();
