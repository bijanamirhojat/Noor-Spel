# Prinsessenkasteel

`games/prinses.html` is alleen de pagina-schil: HUD, de overlays (HTML) en de `<link>`/`<script>`-tags.
De code staat in deze map.

## Indeling

```
js/core.js      constanten, state, prinses-SVG, look, el/place/addObj
js/world.js     kamer-register (defineRoom), WINGS (verdiepingen), scenes, setScene, deur
js/engine.js    edelstenen, bewegen, glitter, camera/main loop, tweens, poes
js/wand.js      toverstaf-spreuken
js/outside.js   buiten: plein, tuin, vijver, eenhoorn, speeltuin, theehuis, meer + bootje
js/sea.js       onder water
js/rooms/*.js   één bestand per kamer: defineRoom({ key, name, icon, build(x) }) + de activiteit
js/map.js       toverlift + kaart
js/main.js      alles opbouwen en starten

css/core.css    basis (kamers, prinses, knoppen, toast, toverstaf)
css/overlay.css gedeelde overlay-onderdelen (titel, sluitknop, tool-/bd-knoppen)
css/rooms/*.css stijl per kamer (kamer-klasse: .room.rm-<key>)
```

## Verdiepingen

Het kasteel heeft vier verdiepingen (`WINGS` in `js/world.js`), elk een eigen wereld met een toverlift
in de eerste kamer. De kaart tekent het kasteel als doorsnede: toren boven, beneden onder, buiten en zee eronder.

## Een kamer toevoegen

1. `js/rooms/<key>.js` met `defineRoom({ key, name, icon, say, build(x) { ... } })`.
   Gebruik in `build` altijd `x + ...` voor posities; elders `roomX('<key>')`, `inRoom('<key>')` en `sceneOf('<key>')`.
2. Eventueel `css/rooms/<key>.css` met `.room.rm-<key> .wall` / `.floor`.
3. Voeg de key toe aan een verdieping in `WINGS` en de `<script>`/`<link>` aan `prinses.html`.
4. Zet de nieuwe bestanden in `PRECACHE_URLS` in `sw.js`.
5. Heeft de kamer een overlay? Voeg de `xxxOpen`-vlag toe aan `overlayOpen()` in `js/engine.js`.

Alle scripts zijn gewone (klassieke) scripts die dezelfde globale scope delen. Een bestand mag bij het laden
nog geen functies uit latere bestanden aanroepen; dat gebeurt pas in `main.js`.
