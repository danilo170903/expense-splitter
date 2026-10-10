# Expense Splitter: specifikacija

## Zahtjevi
1. Prijava: jedan nalog (iz env varijabli). Neprijavljen korisnik ne vidi ni jednu grupu.
2. Korisnik dodaje učesnike u grupu; ime je obavezno i jedinstveno u grupi (bez obzira na velika/mala slova).
3. Korisnik unosi trošak: naziv, iznos, ko je platio. Trošak se dijeli jednako na sve učesnike grupe. Iznosi su u centima.
4. Aplikacija prikazuje ko kome duguje, uz zaokruživanje po AGENTS.md.

## Scenariji

### S1 - Prijava
- Ispravni `APP_USERNAME` i `APP_PASSWORD` → `POST /api/login` vraća 200, `GET /api/me` vraća korisnika.
- Pogrešna lozinka → 401, poruka "Pogrešno korisničko ime ili lozinka".
- Bez prijave, `GET /api/groups` → 401.

### S2 - Učesnici
- Grupa "Put", dodaj "Ana", "Marko", "Iva" → lista ima tri imena u tom redoslijedu.
- Dodaj "ana" kad već postoji "Ana" → 409.
- Dodaj prazno ime ili "   " → 400, učesnik se ne dodaje.

### S3 - Ručak i taksi
- Učesnici: Ana, Marko, Iva
- Ana plaća ručak 90,00 €; Marko plaća taksi 30,00 €
- Rezultat: Iva → Ana 40,00 €; Marko → Ana 10,00 €

### S4 - Zaokruživanje
- Učesnici: Ana, Marko, Iva
- Ana plaća 100,00 € za troje
- Udjeli: 33,34 (Ana) + 33,33 (Marko) + 33,33 (Iva); zbir je tačno 100,00 €
- Višak centa ide prvom učesniku po redoslijedu unosa
- Dugovanja: Marko → Ana 33,33 €; Iva → Ana 33,33 €

### S5 - Neispravan trošak
- Iznos `12,345` → 400 (više od 2 decimale)
- Iznos `0` ili `-5` → 400
- Platilac "Petar" koji nije u grupi → 400
- Prazan naziv troška → 400
- Nijedan od ovih unosa ne ostavlja trošak u grupi.

### S6 - Nema dugovanja
- Učesnik Ana sam u grupi, trošak 50,00 € koji plaća Ana → prikaz "Svi su kvit.", nema dugovanja.

## Šta nije obuhvaćeno
- Više valuta, nejednaka podjela, više korisnika ili registracija.
- Brisanje ili izmjena učesnika i troškova.
- Dijeljenje grupe između korisnika.
- Reset lozinke, uloge, rate limiting.
- Deploy na internet. Aplikacija radi lokalno.
