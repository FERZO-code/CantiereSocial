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
| `index.html` — sezione contatti + footer | Email, numero WhatsApp (`wa.me/39XXXXXXXXXX`), profilo Instagram |
| `index.html` — footer | Ragione sociale, P.IVA, sede |
| `index.html` | Pagine Privacy e Cookie: i link puntano a `#privacy` e `#cookie`, vanno create (obbligatorie per legge se raccogliete dati dal form) |

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

⚠️ **L'handle `cantieresocial` è un segnaposto**: sostituitelo con quello vero.
Si cambia in un colpo solo:

```bash
cd "cantieresocial.it"
sed -i '' 's|instagram.com/cantieresocial/|instagram.com/VOSTRO_HANDLE/|g' index.html
```

Aggiornate anche `sameAs` nei dati strutturati (stessa URL) e aggiungete
Facebook, TikTok e LinkedIn se li avete: `sameAs` è ciò che collega il sito
ai vostri profili agli occhi di Google.

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
destro, poi l'overlay si solleva e scopre la pagina. Durata **1,3 secondi**.

Il codice è scritto da zero (CSS + `requestAnimationFrame`), nessuna libreria
e nessun file preso da altri siti: è lo stesso *tipo* di apertura, con i vostri
colori, il vostro font mono e la griglia da foglio di progetto.

## Regolazioni

In cima a `script.js`:

```js
var UNA_VOLTA = false;   // true = la mostra una sola volta per sessione
var DURATA = 1300;       // durata in millisecondi
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
