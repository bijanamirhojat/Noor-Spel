# Noor's Speelgoed - Web Games

Een verzameling van leuke, kindvriendelijke spelletjes voor Noor.

## Project info

- **Doelgroep:** Kinderen (peuters tot basisschoolleeftijd)
- **Technologie:** HTML, CSS, JavaScript (geen frameworks)
- **PWA:** Installable als app op mobiel/tablet
- **Offline:** Werkt offline na eerste bezoek

## Spelletjes

### 1. Flip (Verzorgingsspel)
Een kat simulator waarin je voor Flip zorgt:
- 🐟 Eten geven (toets: E)
- 💕 Aaien (toets: A)  
- 🧶 Spelen (toets: S)
- 😴 Slapen (toets: Z)
- 💩 Poepen (toets: P)

### 2. Memory
Kaartspel met dierenplaatjes. Draai kaarten om en vind alle paren!

### 3. Kleuren
Kleurplaten waar je op kunt klikken om vlakken in te kleuren.

### 4. Letters
Leer lowercase letters herkennen:
- **Easy:** 3 keuzemogelijkheden
- **Moeilijk:** 5 keuzemogelijkheden

### 5. Cijfers
Leer cijfers herkennen:
- **Easy:** cijfers 0-9, 3 keuzemogelijkheden
- **Moeilijk:** cijfers 0-99, 5 keuzemogelijkheden

## PWA Installatie

Op **iPhone (Safari)**:
1. Open de website
2. Tik op het deel-icoon (☁️)
3. Selecteer "Toevoegen aan beginscherm"

Op **Android (Chrome)**:
1. Open de website
2. Tik op "Installeren" of in het menu "Toevoegen aan beginscherm"

## Structuur

```
Noor-Spel/
├── index.html          # Hoofdmenu met alle spelletjes
├── manifest.json       # PWA manifest
├── sw.js               # Service worker voor offline gebruik
├── games/
│   ├── flip.html       # Flip het verzorgingsspel
│   ├── memory.html     # Memory kaartspel
│   ├── kleuren.html   # Kleuren/kleurplaat
│   ├── letters.html   # Letters herkennen
│   └── cijfers.html   # Cijfers herkennen
└── README.md           # Dit bestand
```

## Responsive Design

- **Mobiel:** Verticaal gestapelde layouts, geoptimaliseerd voor touch
- **Tablet/Desktop:** Horizontale layouts met grotere elementen

Breakpoints:
- 600px: Tablet
- 768px: Grotere tablet/kleine desktop
- 900px+: Desktop

## Touch & Zoom Bescherming

De app is geoptimaliseerd voor jonge kinderen:
- Zoom is uitgeschakeld
- Tekstselectie is uitgeschakeld
- Onbedoelde swipe-acties zijn geblokkeerd

## Ontwikkeling

Open `index.html` in je browser om te testen.

### Linting/Validatie
- HTML: https://validator.w3.org/
- CSS: geen speciale tools nodig

### Git push naar main
```bash
git add .
git commit -m "Add PWA support and new games"
git push origin main
```

## Geschiedenis

- **2026-02-22:** Project gestart met 3 spelletjes (Flip, Memory, Kleuren)
- Responsive design toegevoegd voor mobiel/tablet/desktop
- PWA ondersteuning toegevoegd (manifest, service worker)
- Letters en Cijfers spellen toegevoegd

## TODO / Wensen

- [ ] Puzzel spelletje
- [ ] Muziekspeler
- [ ] Dieren informatie
- [ ] Rennend spelletje
- [ ] Geluidseffecten
- [ ] High scores opslaan (localStorage)
