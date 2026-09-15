# Cantiere Social — cantieresocial.com

Sito statico. Nessuna build, nessuna dipendenza: si carica così com'è.

```
cantieresocial.com/
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── hero-team.png     hero, coppia ritagliata su forma arancione
    ├── team-studio.jpg   foto studio (sezione "Lo studio")
    ├── logo-full.png     lockup completo con la scritta curva (non usato in pagina)
    ├── og-mark.png       anteprima per social e icona iOS
    └── favicon.svg
```

## ⚠️ Da compilare prima di pubblicare

Cercate `DA COMPILARE` nel codice. Sono tutti segnaposto voluti: non ho
inventato numeri né testimonianze.

| Dove | Cosa |
|---|---|
| `index.html` — sezione "I risultati" | ✅ Già disattivata (commentata). Vedi "Riattivare la sezione Risultati" in fondo. |
| `index.html` — sezione contatti + footer | ✅ Email, WhatsApp (`wa.me/393474068285`) e Instagram compilati |
| `index.html` — footer | ✅ P.IVA 08895170721. Nessun indirizzo: l'attività non ha sede aperta al pubblico |
| `privacy.html` | ✅ Titolare: Ferdinando Romanazzi, libero professionista |

## Il form contatti

Invia a `/api/contact` (funzione Vercel) che inoltra con Resend a
`info@cantieresocial.com`. Vedi **"Collegare il form all'email"** più sotto
per l'attivazione.

## Pubblicazione

Caricate la cartella su qualsiasi hosting statico e puntateci il dominio:

- **Netlify / Vercel / Cloudflare Pages** — trascinate la cartella, gratis, HTTPS incluso
- **Hosting tradizionale (Aruba, Register…)** — via FTP dentro `public_html`

Poi aggiornate `og:url` e `canonical` in `index.html` se il dominio cambia.

## Design system

| | |
|---|---|
| Arancio | `#EA7621` (dal logo) |
| Crema | `#FFF8F3` / `#FBEFE5` |
| Inchiostro | `#17120E` |
| Arancio testo | `#A94B0B` (per testo piccolo su fondo chiaro) |
| Caratteri | Archivo (titoli e testo) + IBM Plex Mono (etichette tecniche) |

Tutto è in variabili CSS in cima a `styles.css`: cambiando lì cambia il sito.

Verificato: contrasto AA su tutti i testi, nessuno scroll orizzontale a 375px,
`prefers-reduced-motion` rispettato, form con errori inline e focus gestito.

---

# SEO — cosa è già fatto e cosa tocca a voi

Il sito è tarato su **Rutigliano (BA) + città metropolitana di Bari**.

## ✅ Già nel codice

- `title` e `description` con le parole chiave locali
- Meta `geo.*` e `ICBM` con le coordinate di Rutigliano
- **Dati strutturati** `ProfessionalService`: indirizzo, coordinate, 12 comuni
  in `areaServed`, catalogo dei servizi, fondatori
- **Dati strutturati** `FAQPage`: le 6 domande possono comparire direttamente
  nei risultati Google
- Sezione visibile "Dove lavoriamo" con 18 comuni (lo schema da solo non basta:
  Google vuole i luoghi anche nel testo che legge l'utente)
- Indirizzo completo (NAP) nel footer
- `robots.txt` + `sitemap.xml`
- Immagine di anteprima social 1200×630 (`assets/og-cover.png`)
- HTML semantico, un solo `<h1>`, tutte le immagini con `alt`

## ⚠️ Da sistemare nel codice prima di pubblicare

1. `streetAddress` e `telephone` nei dati strutturati (in fondo al `<head>`)
2. Le coordinate esatte della sede — si leggono dall'URL di Google Maps
3. L'indirizzo nel footer, **identico** a quello di Google Business Profile
4. `sameAs`: aggiungete gli URL reali di Instagram, Facebook, LinkedIn, TikTok
5. `<lastmod>` in `sitemap.xml` a ogni modifica importante

## 📋 Quello che dovete fare voi (in ordine di resa)

### 1. Google Business Profile — la cosa più importante in assoluto
Per un'attività locale la scheda Google vale più del sito. Apritela su
`business.google.com`:
- Categoria principale: **Agenzia di marketing** · secondarie: Servizio di
  video produzione, Web designer, Servizio fotografico
- Zona servita: i comuni della sezione "Dove lavoriamo"
- Foto vere ogni settimana (cantieri, backstage, voi due)
- Post settimanali: la scheda è un mini social

### 2. Recensioni
Chiedetele **sempre** a fine lavoro, con il link diretto della scheda.
È il fattore che sposta di più nel Map Pack locale. Dieci recensioni vere
valgono più di sei mesi di ottimizzazioni tecniche.

### 3. Consistenza NAP
Nome, indirizzo e telefono devono essere identici **ovunque**: sito, Google,
Facebook, Instagram, PagineGialle, Virgilio, Yelp, Bing Places.

### 4. Search Console e Analytics
- `search.google.com/search-console` → verificate il dominio → inviate
  `https://www.cantieresocial.com/sitemap.xml`
- Un'analitica leggera e conforme al GDPR (Plausible, Fathom, o GA4
  configurato bene con banner cookie)

### 5. Pagine dedicate (mese 2-3)
Una home sola compete male. Servono pagine separate, una per servizio+zona,
ognuna con testo originale — **mai** la stessa pagina duplicata cambiando
il nome del comune (Google lo riconosce e lo penalizza):
- `/social-media-imprese-edili-bari`
- `/video-cantiere-bari`
- `/marketing-agenzie-immobiliari-bari`
- `/foto-video-immobiliare-conversano` …

### 6. Casi studio
Ogni lavoro concluso è una pagina: problema → cosa avete fatto → numeri.
È il contenuto che converte **e** che posiziona. Sostituisce anche i
segnaposto della sezione "I risultati".

## Aspettative realistiche

| Chiave | Difficoltà | Tempi |
|---|---|---|
| `agenzia social Rutigliano` | facile | 1-2 mesi |
| `video cantiere Conversano`, `Mola di Bari`… | facile | 2-3 mesi |
| `social media manager Bari` | **difficile** (agenzie già posizionate) | 8-12 mesi |
| `marketing imprese edili Bari` | media (poca concorrenza specializzata) | 4-6 mesi |

La nicchia è il vostro vantaggio: contro "agenzia web Bari" perdete, contro
"comunicazione per imprese edili" non avete quasi concorrenti. Puntate lì.

---

# Analytics (Vercel)

Il sito è **HTML statico**: la procedura con `npm i @vercel/analytics` e il
componente `<Analytics/>` **non si applica** — quella è per progetti
React/Next.js. Qui servono due script tag, già presenti in fondo a
`index.html`:

```html
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

## Per attivarli

Gli script da soli non bastano: le due funzioni vanno accese dal pannello.

1. Vercel → progetto **cantieresocial** → scheda **Analytics** → *Enable*
2. Stessa cosa nella scheda **Speed Insights** → *Enable*
3. Ripubblicate e visitate il sito: i dati compaiono entro ~30 secondi

In locale i due script danno **404**: è previsto, quelle rotte esistono solo
su Vercel. Non è un errore da correggere.

## Privacy

Vercel Web Analytics è **senza cookie** e non traccia gli utenti tra siti
diversi: non serve il banner di consenso, a differenza di Google Analytics.
Va comunque citato nell'informativa privacy.

Se non vedete dati: quasi sempre è un ad blocker sul vostro browser.
Provate in finestra anonima o da un altro dispositivo.

---

# Instagram

Il link compare in tre punti, tutti con la stessa URL:
header (icona sola), menu mobile, footer, più la sezione contatti.

✅ **Handle confermato:** `instagram.com/cantieresocial`.

Se aprite altri profili (Facebook, LinkedIn, TikTok), aggiungeteli a
`sameAs` nei dati strutturati: è ciò che collega il sito ai vostri
profili agli occhi di Google e aiuta la ricerca per nome.

## Nota sulle icone SVG

Gli attributi `fill="none" stroke="currentColor"` stanno **sull'SVG stesso**,
non solo nel CSS. Se stessero solo nel CSS, quando il foglio di stile non è
ancora caricato (o è in cache) il browser disegnerebbe le forme con il
riempimento nero di default: l'icona apparirebbe come un quadrato pieno.

# Cache dei file (importante a ogni deploy)

`styles.css` e `script.js` sono richiamati con `?v=2`. **Alzate quel numero
ogni volta che li modificate**, altrimenti chi ha già visitato il sito
continua a vedere la versione vecchia dalla cache del browser.

```html
<link rel="stylesheet" href="styles.css?v=3">
<script src="script.js?v=3" defer></script>
```

---

# Riattivare la sezione "I risultati"

È **commentata**, non cancellata: il codice è ancora dentro `index.html`,
cercate `SEZIONE DISATTIVATA`. Fuori dal DOM significa che Google non la
legge e i visitatori non la vedono.

Quando avrete numeri e testimonianze veri:

1. Togliete le due righe `INIZIO BLOCCO DISATTIVATO` e `FINE BLOCCO DISATTIVATO`
2. Compilate i quattro numeri (`<dd data-todo>—</dd>`) e le due testimonianze
3. Rinumerate le etichette successive: `05`→`06`, `06`→`07`, `07`→`08`, `08`→`09`
4. Rimettete il fondo alternato: in `styles.css` riportate
   `.studio { background: var(--cream-2); }`
5. Alzate `?v=` su `styles.css` e `script.js`

Il CSS della sezione (`.stats`, `.quotes`, `.proof`) è rimasto: non serve
riscrivere niente.

## Sulle testimonianze

Raccoglietele subito, non "quando avrete tempo". A fine lavoro, mentre il
cliente è contento. Chiedete una frase che dica **cosa non funzionava prima**
e **cosa è cambiato**, possibilmente con un numero. Una testimonianza vaga
("bravi ragazzi, consigliati") converte molto meno di una concreta
("prima ricevevamo due richieste al mese, adesso otto").

---

# Intro / schermata di apertura

Contatore da 0 a 100 in basso a destra, barra arancione che cresce sul bordo
destro, poi l'overlay si solleva e scopre la pagina. Durata **2 secondi**.

Il codice è scritto da zero (CSS + `requestAnimationFrame`), nessuna libreria
e nessun file preso da altri siti: è lo stesso *tipo* di apertura, con i vostri
colori, il vostro font mono e la griglia da foglio di progetto.

## Regolazioni

In cima a `script.js`:

```js
var UNA_VOLTA = false;   // true = la mostra una sola volta per sessione
var DURATA = 2000;       // durata in millisecondi
```

**Consiglio:** se notate che le visite calano, mettete `UNA_VOLTA = true`.
Un'intro vista a ogni ricaricamento diverte la prima volta e infastidisce
dalla terza. E non superate i 1500 ms: oltre, la gente chiude.

## Perché non rallenta la SEO

L'overlay è solo visivo. Il contenuto della pagina esiste già sotto, quindi
Google lo legge normalmente. L'elemento ha `aria-hidden` e `inert`, così i
lettori di schermo lo saltano, e si autodistrugge a fine animazione.

## Le protezioni previste

| Situazione | Cosa succede |
|---|---|
| Utente con animazioni ridotte di sistema | L'intro non compare affatto (3 livelli: script inline, CSS, JS) |
| JavaScript non parte | Dopo 6 s una regola CSS solleva l'overlay: il sito non resta mai bloccato |
| Animazione interrotta a metà | Timeout di sicurezza a 3,8 s che forza l'uscita |
| Scorrimento | Bloccato durante l'intro, sbloccato appena parte l'uscita |

Verificato: a 1217 ms il contatore è a 100 con l'overlay a piena pagina, a
1420 ms l'overlay è sollevato e lo scorrimento è già libero, poi l'elemento
viene rimosso dal DOM.

---

# Collegare il form all'email

Il modulo invia a `/api/contact`, una funzione serverless che gira su Vercel
e inoltra la richiesta a `info@cantieresocial.com` tramite **Resend**.

## Perché non si invia direttamente da Gmail

Un browser non può parlare con i server SMTP di Google, e le credenziali di
Google Workspace nel codice del sito sarebbero **leggibili da chiunque**
apra il sorgente della pagina. Serve sempre un servizio che invii lato
server, con la chiave protetta. Qui la chiave sta in una variabile
d'ambiente su Vercel: nel codice scaricato dal browser non compare mai.

## 1. Account Resend

Registratevi su `resend.com` (3.000 email/mese gratis, più che sufficienti).

## 2. Verificate il dominio — ⚠️ usate un SOTTODOMINIO

In Resend → *Domains* → *Add Domain*, inserite:

```
send.cantieresocial.com
```

**Non** `cantieresocial.com` da solo. Il motivo è concreto: Resend chiede di
aggiungere un record SPF, ma sul dominio principale ne avete già uno che
serve a Google Workspace. Due record SPF sullo stesso dominio **rompono la
consegna della vostra posta aziendale**: le email di Gmail iniziano a finire
nello spam. Con un sottodominio dedicato i due sistemi non si toccano.

## 3. Record DNS su Cloudflare

Resend vi mostra 3 record (MX, TXT per SPF, TXT per DKIM). Copiateli
**esattamente come li dà**, in Cloudflare → DNS → *Add record*.

- Non modificate i valori, nemmeno gli spazi
- Lasciateli **DNS only** (nuvola grigia), non proxied
- La propagazione richiede da pochi minuti a qualche ora

Poi in Resend premete *Verify*.

## 4. Chiave API

Resend → *API Keys* → *Create*. Copiatela subito: viene mostrata una volta
sola. Trattatela come una password.

## 5. Variabili d'ambiente su Vercel

Progetto → *Settings* → *Environment Variables*. Aggiungete:

| Nome | Valore | Ambienti |
|---|---|---|
| `RESEND_API_KEY` | la chiave copiata al punto 4 | Production, Preview, Development |
| `MAIL_TO` | `info@cantieresocial.com` | tutti |
| `MAIL_FROM` | `Sito Cantiere Social <sito@send.cantieresocial.com>` | tutti |

`MAIL_TO` e `MAIL_FROM` sono facoltative: senza, la funzione usa già questi
valori come predefiniti. `RESEND_API_KEY` è obbligatoria.

**Le variabili si applicano solo ai deploy successivi**: dopo averle
aggiunte, ripubblicate.

## 6. Provate

Compilate il modulo dal sito pubblicato. Dovreste ricevere l'email su Gmail
entro pochi secondi. Premendo *Rispondi* scrivete direttamente al cliente:
la funzione imposta il suo indirizzo come `reply_to`.

## Se qualcosa non funziona

Vercel → progetto → *Logs*, filtrate su `/api/contact`. La funzione scrive
in log il motivo esatto.

| Messaggio | Causa |
|---|---|
| `RESEND_API_KEY non configurata` | Variabile mancante, o deploy fatto prima di aggiungerla |
| `Resend ha risposto 403` | Dominio non ancora verificato, o `MAIL_FROM` su un dominio diverso da quello verificato |
| `Resend ha risposto 422` | `MAIL_FROM` scritto male |
| Nulla nei log | La richiesta non arriva: controllate che la cartella `api/` sia stata pubblicata |

**In locale il form dà sempre errore**: `python3 -m http.server` serve file
statici e non esegue funzioni serverless, quindi `/api/contact` risponde 404.
È previsto. Per provarlo in locale servirebbe `vercel dev`.

## Anti-spam

C'è un campo trappola invisibile (`website`): i bot lo compilano, gli umani
no. Se arriva pieno, la funzione finge di aver accettato e butta via il
messaggio, così il bot non impara ad aggirarla.

La validazione è **ripetuta lato server**. Quella nel browser è comodità per
l'utente, non sicurezza: chiunque può aggirarla in dieci secondi.

## Nota per l'informativa privacy

Con questo collegamento **Vercel** e **Resend** diventano responsabili del
trattamento dei dati inviati dal modulo. Vanno nominati nell'informativa
privacy, insieme alla base giuridica e ai tempi di conservazione.

---

# Limite di frequenza sul form

Il modulo è protetto da quattro filtri, in quest'ordine.

| Filtro | Cosa blocca | Risposta |
|---|---|---|
| Limite per IP | Oltre **3 invii in 10 minuti** dallo stesso indirizzo | `429` con i secondi di attesa |
| Tetto globale | Oltre **20 invii in 10 minuti** in totale | `429` |
| Campo trappola (`website`) | Bot che compilano ogni campo | `200` finto, nessuna email |
| Trappola temporale | Invii in meno di **3 secondi** dall'apertura | `200` finto, nessuna email |

Le due trappole rispondono `200` di proposito: dire "sei stato scoperto"
insegnerebbe al bot come aggirarle.

## Due scelte di progetto

**Gli errori di compilazione non consumano tentativi.** Il conteggio scatta
solo un istante prima di spedire davvero. Chi sbaglia l'email tre volte non
si ritrova bloccato: sarebbe il modo più rapido per perdere un cliente vero.

**Il tetto globale protegge la quota Resend.** Senza, un attacco potrebbe
bruciare le 3.000 email mensili in un pomeriggio e lasciarvi muti proprio
quando arriva una richiesta vera.

## Il limite di questa soluzione — leggetelo

Le funzioni Vercel sono **senza stato e replicate**: il conteggio vive nella
memoria di una singola istanza, e istanze diverse non si parlano. Quindi:

- non è una barriera invalicabile: chi distribuisce le richieste su molti IP,
  o colpisce quando Vercel ha più istanze attive, può superare i numeri sopra;
- ferma però doppi clic, invii ripetuti e bot ingenui, che è praticamente
  tutto quello che vedrete su un form di contatto di un'attività locale.

È una scelta proporzionata: zero infrastruttura, zero costi, zero manutenzione.

**Se un giorno subirete abusi veri**, il passo successivo è uno store condiviso
fra le istanze: Upstash Redis ha un'API REST, quindi si integra con la stessa
`fetch` già usata per Resend, senza aggiungere dipendenze npm. Si sostituiscono
`controllaLimite` e `registraInvio` con due chiamate a Redis e il resto del
codice resta identico.

## Regolare i limiti

In cima ad `api/contact.js`:

```js
const FINESTRA_MS   = 10 * 60 * 1000;  // ampiezza della finestra
const MAX_PER_IP    = 3;               // invii per IP nella finestra
const MAX_GLOBALE   = 20;              // invii totali nella finestra
const ATTESA_MINIMA = 3000;            // ms minimi per compilare
```

Dopo ogni modifica rilanciate la prova:

```bash
cd test && node prova-limite.js
```

Esercita la funzione con richieste finte e `fetch` sostituita: verifica i
limiti **senza inviare nessuna email**. Copre 12 casi, fra cui che gli errori
di compilazione non brucino tentativi e che il tetto globale scatti.

La cartella `test/` è esclusa dalla pubblicazione tramite `.vercelignore`.

## Client-side o server-side?

**Tutti i limiti sono applicati dal server** (`api/contact.js`). È l'unico
posto che conta: il browser può mentire su qualsiasi cosa.

| Controllo | Deciso da | Il client può aggirarlo? |
|---|---|---|
| Limite 3 invii/IP | server | no |
| Tetto globale 20/10min | server | no |
| Campo trappola | server | solo lasciandolo vuoto |
| Trappola temporale | server, ma il valore arriva dal client | **sì, falsificando `ts`** |
| Validazione campi | server (ripetuta) | no |
| Neutralizzazione HTML | server | no |
| Bottone bloccato | client | sì — è solo comodità |
| Validazione immediata | client | sì — è solo comodità |

I due controlli lato client servono **soltanto** a rendere l'esperienza
gradevole, non proteggono nulla. Per questo tutto è ricontrollato dal server.

### La trappola temporale è un filtro, non una barriera

Il valore `ts` lo genera il browser, quindi un aggressore competente può
scriverci quello che vuole. Taglia i compilatori automatici ingenui, che
sono la maggioranza del rumore; non fermerebbe un attacco mirato. Il limite
per IP è la difesa vera.

### Come viene ricavato l'IP

`x-forwarded-for` è un header che **il client può inviare**: se la
piattaforma lo accodasse invece di sostituirlo, la prima voce sarebbe scelta
dall'aggressore, che ruotando IP finti aggirerebbe il limite.

Per questo `ipRichiesta()` preferisce, in ordine:

1. `x-real-ip` — impostato dal proxy, non falsificabile
2. `x-vercel-forwarded-for` — idem
3. `x-forwarded-for` — ultima risorsa, e prendendo l'**ultima** voce
   (quelle iniettate dal client finiscono in testa, quelle dei proxy di
   fiducia in coda)

La prova `test/prova-limite.js` copre anche questo caso: invia IP finti in
`x-forwarded-for` con un `x-real-ip` reale e verifica che il limite segua
quello vero.

---

# SEO lato Vercel (`vercel.json`)

| Regola | Perché |
|---|---|
| `cantiere-social.vercel.app` → `www.cantieresocial.com` (308) | L'alias di produzione serviva il sito intero **senza** `noindex`: Google poteva indicizzare un doppione. Gli URL dei singoli deploy invece sono già protetti da login e `noindex`. |
| `cleanUrls` | `/index.html` rispondeva `200`: seconda copia della home. Ora reindirizza a `/`. |
| `X-Robots-Tag: noindex` su `/api/` | Gli endpoint non devono mai finire nei risultati. |
| `Disallow: /api/` in `robots.txt` | Idem, lato crawler. |
| CSS/JS in cache 1 anno, immagini 7 giorni | Prima tutto aveva `max-age=0`: ogni visita riscaricava tutto. Velocità = Core Web Vitals = posizionamento. |
| `nosniff`, `Referrer-Policy` | Igiene di sicurezza di base. |

## ⚠️ Conseguenza importante della cache

`styles.css` e `script.js` ora restano **un anno** nel browser di chi visita.
La regola del `?v=` diventa quindi obbligatoria: **modificate CSS o JS senza
alzare `?v=` in `index.html`, e chi è già passato vedrà la versione vecchia
fino all'anno prossimo.**

Le immagini non hanno numero di versione, per questo la cache è di soli 7
giorni. Se sostituite un'immagine, cambiatele nome.

## Verifica dopo ogni deploy

```bash
zsh test/verifica-seo.sh
```

Controlla online 15 punti: doppioni, redirect, robots, sitemap, canonical,
404, header delle API, cache.

## Google Search Console

Non passa da Vercel: la verifica della *proprietà dominio* si fa con un
record TXT su **Cloudflare**, che gestisce il vostro DNS. Poi inviate
`sitemap.xml` da Search Console.

`sitemap.xml` → aggiornate `<lastmod>` quando cambiate contenuti rilevanti.

---

# Informativa privacy e cookie policy

Pagine: `privacy.html` e `cookie.html`, raggiungibili su `/privacy` e `/cookie`
grazie a `cleanUrls` in `vercel.json`. In locale con `python3 -m http.server`
aprite `/privacy.html`: gli indirizzi senza estensione funzionano solo su Vercel.

## Su cosa si basano

Non è un modello generico: descrivono ciò che il sito fa davvero, verificato
sul sito pubblicato il 10 settembre 2026.

- **Nessun cookie**, nessun dato in `localStorage` o `sessionStorage`, nessun
  iframe, anche con Vercel Analytics e Speed Insights attivi
- Unico servizio esterno contattato dal browser: **Google Fonts**
- Modulo: Vercel (funzione) → Resend (invio) → Google Workspace (casella)
- IP del limitatore: solo in memoria, mai su disco
- **Google Search Console**: non installa nulla sul sito; è citata per
  trasparenza, perché i dati che mostra vengono dalla ricerca Google

Per questo, fino all'arrivo di Google Ads, non serviva il banner. **Aggiornamento:** ora il banner c'è, vedi «Cookie e Google Ads».

## ⚠️ Da completare

✅ **Titolare del trattamento**: Ferdinando Romanazzi, libero professionista, che opera con il marchio Cantiere Social (P.IVA 08895170721). Lo stesso nome compare nel footer delle tre pagine e come `legalName` nei dati strutturati.

**Conservazione delle richieste**: ho scritto "entro 24 mesi dall'ultimo
contatto se non nasce un incarico". È una scelta vostra: se preferite un
periodo diverso, cambiatelo nella sezione 07.

## Quando vanno aggiornate — importante

Le due pagine descrivono il sito **con Google Ads attivabile solo su consenso**. Vanno riviste
prima di aggiungere, per esempio:

| Se aggiungete… | Cosa cambia |
|---|---|
| Meta Pixel, Google Ads, LinkedIn Insight | Serve il **banner con consenso preventivo**, rifiuto facile quanto l'accettazione |
| Google Analytics | Idem: usa cookie |
| Video YouTube o mappe Google incorporate | Idem, a meno di caricarli solo dopo il consenso |
| Un nuovo fornitore che riceve dati (CRM, newsletter) | Va aggiunto alla tabella fornitori della privacy |

A ogni modifica aggiornate anche la data "Ultimo aggiornamento" in cima.

## Google Business Profile senza sede

Non avendo una sede aperta al pubblico, create la scheda come **attività che
raggiunge i clienti**: nascondete l'indirizzo e impostate come zona servita i
comuni della sezione "Dove lavoriamo". Coerente con il sito, che ora indica
solo "Rutigliano (BA)" senza via né coordinate.

---

# Cookie, Google Analytics e Google Ads (`consenso.js`)

Banner di consenso e tag di Google Ads in un unico file, senza servizi esterni.

## Come funziona

- **Prima del consenso il tag non viene caricato**: nessun cookie pubblicitario,
  nessuna richiesta a Google. È il Consent Mode di Google in modalità "base",
  la più prudente rispetto alle regole del Garante.
- **Rifiuta** e **Accetta** hanno la stessa evidenza; la × equivale a rifiutare.
- La scelta resta nel browser (`cs_consenso`, memoria locale) per **6 mesi**.
- **Accetta** concede solo `ad_storage` e `ad_user_data` (misurare le
  conversioni). `ad_personalization` resta negato: **niente remarketing**.
- **Preferenze cookie** nel footer riapre le scelte; la revoca cancella i cookie
  `_gcl*` e ricarica la pagina senza tag.
- Conversioni inviate: **invio riuscito del modulo** e **clic su WhatsApp**.

## ⚠️ Per attivarlo: tre valori in cima a `consenso.js`

```js
var GOOGLE_ADS_ID      = 'AW-XXXXXXXXXX';
var ETICHETTA_MODULO   = '';
var ETICHETTA_WHATSAPP = '';
```

**Finché `GOOGLE_ADS_ID` resta `AW-XXXXXXXXXX` il file non fa nulla**: niente
banner, niente tag. Si può pubblicare senza rischi anche prima di averlo.

Dove trovarli in Google Ads:

1. **Obiettivi → Conversioni → Nuova azione di conversione → Sito web**
2. Create due azioni: *Invio modulo* (categoria "Invia modulo per i lead") e
   *Clic su WhatsApp* (categoria "Contatto")
3. Scegliete la configurazione **manuale con codice**
4. Nello snippet dell'evento trovate `send_to: 'AW-123456789/AbCdEfGhIj'`:
   - `AW-123456789` → `GOOGLE_ADS_ID`
   - `AbCdEfGhIj` (dopo la `/`) → l'etichetta di quella conversione

**Non incollate lo snippet di Google nelle pagine**: caricherebbe il tag senza
consenso. Bastano i tre valori qui sopra.

Le campagne create da Business Profile (campagne "Smart") a volte non mostrano
le azioni di conversione personalizzate: in quel caso passate alla
**modalità esperta** di Google Ads.

`consenso.js` non ha `?v=` perché non è nella regola di cache lunga di
`vercel.json`: il browser lo ricontrolla a ogni visita.

## Provarlo

In locale, `test/consenso-prova.html` usa un ID finto (`AW-000000000`) e
permette di provare banner, preferenze e caricamento del tag senza toccare il
file vero. La cartella `test/` non viene pubblicata.

Sul sito pubblicato, dopo aver inserito l'ID: aprite il sito in una finestra
anonima → Strumenti per sviluppatori → **Applicazione → Cookie**. Prima di
premere Accetta non deve esserci nessun cookie `_gcl`; nella scheda **Rete** non
deve comparire `googletagmanager.com`.

## Quando va aggiornato — importante

| Se cambiate… | Cosa fare |
|---|---|
| Aggiungete remarketing, Meta Pixel, Google Analytics, LinkedIn Insight | Nuova categoria nel banner, aggiornare privacy e cookie policy, **alzare `VERSIONE`** |
| Aggiungete video YouTube o mappe Google incorporate | Idem: caricarli solo dopo il consenso |
| Cambiano i cookie elencati nella cookie policy | Aggiornare la tabella e **alzare `VERSIONE`** |

Alzare `VERSIONE` fa ricomparire il banner a tutti: il consenso dato per
finalità diverse non vale per quelle nuove.

## Google Analytics 4 — `G-Y99687KHVT`

Già configurato in `consenso.js`, nella categoria **Statistiche**: il banner è
quindi **attivo da subito**, anche senza l'ID di Google Ads.

**⚠️ Non incollate lo snippet "Google tag (gtag.js)"** che Google mostra
nell'installazione: carica Analytics *prima* del consenso e imposta i cookie
`_ga` a tutti i visitatori, in violazione delle regole del Garante. Il file
`consenso.js` fa lo stesso lavoro, ma solo dopo "Accetta".

Eventi inviati ad Analytics (solo con consenso alle statistiche):

| Evento | Quando |
|---|---|
| `page_view` | automatico, a ogni pagina |
| `generate_lead` | invio riuscito del modulo |
| `clic_whatsapp` | clic su un link WhatsApp |

### Impostazioni da fare in Google Analytics

1. **Amministrazione → Raccolta e conservazione dei dati → Conservazione dei
   dati**: scegliete 2 o 14 mesi. L'informativa dice "al massimo 14 mesi".
2. **Amministrazione → Raccolta dei dati → Google Signals**: lasciatelo
   **disattivato**. Il sito lo spegne già, e l'informativa lo dichiara.
3. **Amministrazione → Eventi**: segnate `generate_lead` e `clic_whatsapp` come
   **eventi chiave** (compaiono dopo il primo invio registrato).

### Conversioni su Google Ads senza l'ID `AW-`

Collegando Analytics a Google Ads potete importare gli eventi chiave come
conversioni, senza compilare `GOOGLE_ADS_ID`:

**Analytics → Amministrazione → Collegamenti ai prodotti → Google Ads → Collega**,
poi in **Google Ads → Obiettivi → Conversioni → Importa → Google Analytics 4**.

Limite da conoscere: le conversioni importate da Analytics si registrano solo
per chi accetta le **statistiche**. Se in futuro compilate anche
`GOOGLE_ADS_ID`, nel banner comparirà la categoria **Pubblicità** e le
informative la descrivono già.

---

# Finestra di contatto WhatsApp

Pulsante verde in basso a destra, su tutte le pagine. Apre una piccola
finestra con la scelta del settore e un pulsante che apre WhatsApp con il
messaggio già scritto. Il codice è in fondo a `script.js`, gli stili in fondo a
`styles.css`.

- **Nessuno script di WhatsApp**: è un normale link `wa.me`. A WhatsApp non
  arriva nulla finché la persona non invia il messaggio, per questo
  l'informativa privacy non cambia.
- Il clic su **Apri la chat su WhatsApp** conta come `clic_whatsapp` in
  Analytics e Google Ads, solo con il consenso alle statistiche.
- Con il banner dei cookie aperto il pulsante sale sopra il banner; il footer
  ha spazio in più in fondo, così i link finali non restano coperti.
- Verde `#0F7A6D` invece del verde WhatsApp originale `#25D366`: con il testo
  bianco l'originale ha contrasto 2:1, illeggibile per molti.

## Cambiare numero o messaggi

In fondo a `script.js`:

```js
var NUMERO = '393474068285';          // prefisso 39, senza + e senza spazi
var MESSAGGI = { edile: "...", showroom: "...", immobiliare: "...", altro: "..." };
```

Dopo la modifica alzate `?v=` di `script.js` in tutte e tre le pagine.

---

# Pagina Pacchetti (`/pacchetti`)

File: `pacchetti.html`, `pacchetti.css`, `pacchetti.js`. Usa anche `styles.css`,
`script.js` e `consenso.js` come la home.

## Com'è fatta

- **Cartello dei lavori** in apertura: fa da indice dei 4 pacchetti.
- **Barra dei lotti** che resta in alto mentre si scorre ed evidenzia la
  sezione in cui ci si trova.
- **01 Per commessa**: Essenziale €390 · Racconto €690 · Completa €990.
  Completa è quello messo in evidenza; il risparmio è calcolato su 1 video
  Essenziale (2 × 390 − 690 = €90; 4 × 390 − 990 = €570).
- **02 Pacchetto social**: da €1.490/mese, cinque fasi.
- **03 Pacchetto sito web**: da €1.590 una tantum, foto professionali incluse.
- **Servizi singoli**: produzione €490 · social media management €790/mese ·
  advertising €490/mese · sito €990 · SEO €390/mese · brand identity €890.
  I singoli sono prezzati apposta sopra i pacchetti: social + advertising
  separati fanno €1.280/mese, il Pacchetto social €1.490 con molto di più;
  il solo sito €990, il Pacchetto sito web €1.590 con foto professionali, SEO e Google Ads.
- **04 Servizi singoli**: si selezionano i servizi e compare il totale di
  partenza (una tantum e mensile separati). Se la combinazione somiglia a un
  pacchetto, compare un consiglio.

## Cambiare un prezzo — punti da toccare tutti

1. `pacchetti.html`: testo visibile, cartello in apertura, dati strutturati
   (`application/ld+json`) e, per i servizi singoli, l'attributo
   `data-prezzo` della casella.
2. Se cambiano i tagli per commessa, ricalcolate "€… a video" e "risparmiate €…".
3. `pacchetti.js`: i testi del consiglio citano €1.280, €210 e €1.590.
   `pacchetti.html` cita €1.280 (Pacchetto social) ed €990 (Pacchetto sito web)
   nelle righe di confronto.
4. `script.js`: i messaggi precompilati (`RICHIESTE`) citano i prezzi.
5. `index.html`: card della sezione pacchetti, FAQ "Quanto costano i
   pacchetti?" (sia nel testo sia nel JSON-LD) e catalogo nel JSON-LD.

## Richiesta precompilata

I pulsanti della pagina portano al modulo in home con un parametro, per
esempio `/?richiesta=commessa-completa#contatti`. `script.js` legge il
parametro e scrive nel campo "Cosa vi serve" un testo fisso già previsto
(solo valori noti: nulla dell'indirizzo finisce nel modulo così com'è).

Valori: `sopralluogo`, `commessa`, `commessa-essenziale`, `commessa-racconto`,
`commessa-completa`, `social`, `sito-web`, `servizi` (con
`&servizi=produzione|social|advertising|sito|seo|brand`, anche più volte).

Il configuratore dei servizi singoli funziona anche senza JavaScript: è un
normale modulo che porta alla home con i servizi scelti.

## Intro della home

Chi arriva in home da un'altra pagina del sito, o su un'ancora come
`#contatti`, non vede l'intro: altrimenti ogni clic su "Richiedi un
preventivo" costerebbe due secondi di attesa.

## Versioni dei file

`pacchetti.css` e `pacchetti.js` hanno la stessa cache di un anno di
`styles.css` e `script.js` (`vercel.json`): alzate `?v=` in `pacchetti.html`
a ogni modifica. La pagina carica Archivo con l'asse della larghezza
(`wdth`), usato per la scritta stretta di prezzi e cartello.

---

# Home — interazioni aggiunte

- **Menu**: "Pacchetti" porta a `/pacchetti`; mentre si scorre la home,
  la voce della sezione in vista resta evidenziata.
- **Metodo · avanzamento lavori**: la barra arancione scende lungo le cinque
  fasi e ogni fase si accende quando la si raggiunge (`script.js`, blocco
  "Metodo: avanzamento lavori"). Senza JavaScript o con "riduci animazioni"
  la barra resta piena e tutte le fasi accese.
- **Per chi lavoriamo** (sezione 01, subito dopo il ticker): linguette per
  settore (Imprese edili · Showroom · Agenzie immobiliari). Ogni scheda ha
  "Da dove partire" con pacchetto e prezzo: Completa €990, Pacchetto social
  da €1.490/mese, Essenziale €390. **Se cambiate i prezzi, aggiornate anche
  queste tre schede.** "Richiedi un preventivo" precompila nel modulo il
  settore (`data-settore`, deve coincidere con il testo dell'opzione) e
  l'interesse (`data-interesse`).
- **FAQ**: le domande visibili e quelle nei dati strutturati (`FAQPage`)
  devono dire la stessa cosa: Google lo richiede.
- **Modulo · "Cosa vi interessa"**: pulsanti che scrivono la riga
  "Mi interessa: …" in cima al messaggio. Non aggiungono campi: la funzione
  `api/contact.js` non va toccata.

> La sezione "Il problema" (racconto a scene) è stata rimossa su richiesta:
> toglieva troppa visibilità al resto della pagina.

---

# Offerta speciale — pop-up "3 video al prezzo di 1"

Pop-up a forma di cartello dei lavori: **3 video a €390 fino al 1° ottobre
2026**, con nome, cellulare e casella privacy. Compare su home e `/pacchetti`,
non sulle pagine legali.

- **Dove si cambia**: logica e testi in `script.js` (blocco "OFFERTA
  SPECIALE", in fondo), stile in `styles.css` (blocco omonimo, in fondo).
- **Impostazioni** in cima al blocco di `script.js`:
  - `FINE`: ultimo istante valido. Dopo, il pop-up non compare più da solo.
  - `ATTESA_MS` (10 s) e `SOGLIA_SCORRIMENTO` (un terzo di pagina): quando compare.
  - `RIPROPONI_GIORNI` (3): dopo quanto si ripropone a chi l'ha chiuso.
- **Quando non compare**: sopra l'intro, il banner cookie, un'altra finestra
  aperta, la chat WhatsApp aperta, mentre si scrive in un campo, a chi arriva
  già sul modulo (`#contatti` o `?richiesta=`), a chi l'ha già inviato.
- **Cosa arriva**: un'email a info@cantieresocial.com con oggetto
  "Offerta 3 video — Nome · cellulare", nome, cellulare cliccabile e pagina
  di provenienza. Non c'è un indirizzo a cui rispondere: si richiama.
- **Server** (`api/contact.js`): con `tipo: 'offerta'` valida solo nome e
  cellulare italiano (3xx, con +39 facoltativo) e la privacy. Stesse
  protezioni del modulo: trappola anti-spam, trappola temporale, limite di
  invii (condiviso con il modulo).
- **Conversione**: l'invio conta come `generate_lead`, come il modulo, e solo
  con il consenso.
- **Privacy e cookie**: l'informativa cita il modulo dell'offerta; la cookie
  policy elenca `cs_offerta` (memoria locale, tecnica, senza consenso).
- **Per rivedere il pop-up in prova**: dalla console del browser
  `localStorage.removeItem('cs_offerta')` e ricaricate.
- **A offerta finita**: si può lasciare così (non compare più) o togliere il
  blocco da `script.js` e `styles.css`, la riga `cs_offerta` dalla cookie
  policy e il paragrafo dall'informativa.
