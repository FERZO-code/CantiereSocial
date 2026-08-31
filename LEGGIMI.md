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
| `index.html` — sezione "I risultati" | I quattro numeri (ora `—`) e le due testimonianze. **Se non li avete ancora, cancellate l'intera sezione `<section class="section proof">`**: meglio niente che finti. |
| `index.html` — sezione contatti + footer | Email, numero WhatsApp (`wa.me/39XXXXXXXXXX`), profilo Instagram |
| `index.html` — footer | Ragione sociale, P.IVA, sede |
| `index.html` | Pagine Privacy e Cookie: i link puntano a `#privacy` e `#cookie`, vanno create (obbligatorie per legge se raccogliete dati dal form) |

## Il form contatti

Adesso **apre il programma di posta** dell'utente con il messaggio già
compilato. Funziona ovunque senza server, ma perde qualche contatto da
mobile. Per riceverli davvero via web, in `script.js` cercate il commento
`Senza backend` e sostituite il blocco con una `fetch()` verso un servizio
tipo Formspree, Basin o Web3Forms.

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
