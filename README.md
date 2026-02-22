# Noor's Speelgoed - Web Games

Een verzameling van leuke, kindvriendelijke spelletjes voor Noor.

## Project info

- **Doelgroep:** Kinderen (peuters tot basisschoolleeftijd)
- **Technologie:** HTML, CSS, JavaScript (geen frameworks)
- **Offline:** Werkt zonder internet (behalve voor Google Fonts en enkele externe plaatjes)

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

## Structuur

```
Noor-Spel/
├── index.html          # Hoofdmenu met alle spelletjes
├── games/
│   ├── flip.html       # Flip het verzorgingsspel
│   ├── memory.html     # Memory kaartspel
│   └── kleuren.html   # Kleuren/kleurplaat
└── README.md           # Dit bestand
```

## Responsive Design

- **Mobiel:** Verticaal gestapelde layouts
- **Tablet/Desktop:** Horizontale layouts met grotere elementen

Breakpoints:
- 600px: Tablet
- 768px: Grotere tablet/kleine desktop
- 900px+: Desktop

## Ontwikkeling

Open `index.html` in je browser om te testen.

### Linting/Validatie
- HTML: https://validator.w3.org/
- CSS: geen speciale tools nodig

## Geschiedenis

- **2026-02-22:** Project gestart met 3 spelletjes (Flip, Memory, Kleuren)
- Responsive design toegevoegd voor mobiel/tablet/desktop

## TODO / Wensen

- [ ] Puzzel spelletje
- [ ] Muziekspeler
- [ ] Dieren informatie
- [ ] Rennend spelletje
- [ ] Offline versie (geen externe afhankelijkheden)
- [ ] Geluidseffecten
- [ ] High scores opslaan (localStorage)
