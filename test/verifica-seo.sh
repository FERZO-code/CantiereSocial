#!/bin/zsh
# Verifica la SEO lato Vercel sul sito pubblicato. Da lanciare DOPO il deploy.
#   zsh test/verifica-seo.sh
setopt NO_NOMATCH
U=https://www.cantieresocial.com
ok=0; ko=0
controlla() { if eval "$2" >/dev/null 2>&1; then echo "  ✓ $1"; ok=$((ok+1)); else echo "  ✗ $1"; ko=$((ko+1)); fi }
code()   { curl -sS -o /dev/null --max-time 15 -w "%{http_code}" "$1"; }
dest()   { curl -sS -o /dev/null --max-time 15 -w "%{redirect_url}" "$1"; }
header() { curl -sSI --max-time 15 "$1" | tr -d '\r' | grep -i "^$2:"; }

echo "— Doppioni —"
controlla "vercel.app reindirizza al dominio (308)" '[ "$(code https://cantiere-social.vercel.app/)" = 308 ]'
controlla "…verso www.cantieresocial.com"          '[[ "$(dest https://cantiere-social.vercel.app/)" == https://www.cantieresocial.com/* ]]'
controlla "/index.html reindirizza a /"            '[ "$(code $U/index.html)" = 308 ]'
controlla "apex → www"                              '[ "$(code https://cantieresocial.com/)" = 308 ]'
controlla "http → https"                            '[ "$(code http://www.cantieresocial.com/)" = 308 ]'

echo "— File per i motori di ricerca —"
controlla "robots.txt 200"                          '[ "$(code $U/robots.txt)" = 200 ]'
controlla "robots.txt esclude /api/"                'curl -sS $U/robots.txt | grep -q "Disallow: /api/"'
controlla "sitemap.xml 200"                         '[ "$(code $U/sitemap.xml)" = 200 ]'
controlla "canonical sulla home"                    'curl -sS $U/ | grep -q "rel=\"canonical\" href=\"https://www.cantieresocial.com/\""'
controlla "pagina inesistente → 404 vero"           '[ "$(code $U/xyz-non-esiste)" = 404 ]'

echo "— Pagine legali —"
controlla "/privacy 200"                             '[ "$(code $U/privacy)" = 200 ]'
controlla "/cookie 200"                              '[ "$(code $U/cookie)" = 200 ]'
controlla "/privacy.html reindirizza a /privacy"     '[ "$(code $U/privacy.html)" = 308 ]'
controlla "footer linka la privacy"                  'curl -sS $U/ | grep -q "href=\"/privacy\""'
controlla "WhatsApp nel formato ufficiale"           'curl -sS $U/ | grep -q "wa.me/393474068285"'

controlla "consenso.js 200"                          '[ "$(code $U/consenso.js)" = 200 ]'
controlla "nessun tag Google nell’HTML (solo su consenso)" '! curl -sS $U/ | grep -q googletagmanager'
controlla "nessun Set-Cookie dal server"             '! curl -sSI $U/ | grep -qi "^set-cookie"'

echo "— API e sicurezza —"
controlla "diagnostica rimossa"                     '[ "$(code "$U/api/diagnostica?k=cantiere")" = 404 ]'
controlla "/api con X-Robots-Tag noindex"           'header $U/api/contact x-robots-tag | grep -qi noindex'
controlla "header nosniff"                          'header $U/ x-content-type-options | grep -qi nosniff'

echo "— Cache (Core Web Vitals) —"
controlla "CSS in cache 1 anno"                     'header "$U/styles.css?v=7" cache-control | grep -q 31536000'
controlla "immagini in cache 7 giorni"              'header $U/assets/hero-team.png cache-control | grep -q 604800'

echo; echo "Superati: $ok · Falliti: $ko"; [ $ko -eq 0 ]
