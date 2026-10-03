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
js/village.js   het dorp: huisjes, koets, overlay-hulpjes (ovFly, ovCheer, bounceEl)
js/dorp/*.js    dorpsplein, markt (boodschappen + betalen), ijssalon (ijsjes maken)
js/sky.js       het wolkenrijk: gouden wolk buiten, aankomst, regenboogglijbaan terug
js/wolken/*.js  wolkenpoort, weermakerij (weer maken), wolkenkasteel (wolkjes kijken)
js/rooms/*.js   één bestand per kamer: defineRoom({ key, name, icon, build(x) }) + de activiteit
js/map.js       toverlift + kaart
js/stickers.js  stickerboek
js/main.js      alles opbouwen en starten

css/core.css    basis (kamers, prinses, knoppen, toast, toverstaf)
css/overlay.css gedeelde overlay-onderdelen (titel, sluitknop, tool-/bd-knoppen)
css/rooms/*.css stijl per kamer (kamer-klasse: .room.rm-<key>)
```

## Verdiepingen

Het kasteel heeft vier verdiepingen (`WINGS` in `js/world.js`), elk een eigen wereld met een toverlift
in de eerste kamer. De kaart tekent het kasteel als doorsnede: toren boven, beneden onder, buiten en zee eronder.

## Dorp

Een eigen wereld (`VILLAGE` in `js/world.js`, scene `dorp`). De koets op het kasteelplein rijdt erheen
(`addKoets` / `rideCarriage` in `js/village.js`); op het dorpsplein staat de koets terug.
De dorpskamers gebruiken ook `defineRoom`, dus `roomX`, `inRoom` en stickers werken er hetzelfde.

## Wolken

Nog een eigen wereld (`SKY` in `js/world.js`, scene `wolken`). Boven de eenhoornweide hangt een gouden wolk
(`buildCloudPortal`, `PORTAL_X` in `js/sky.js`); vlieg er met de eenhoorn tegenaan om naar boven te gaan.
Terug via de regenboogglijbaan op de wolkenpoort. Op de kaart zweven de wolken boven het kasteel.

## Stickerboek

Elke kamer heeft een sticker (het kamer-icoon). Je verdient hem door een hoofdactiviteit te doen
(een object met een `.tap-hint` 👇) of door 3 verschillende objecten in die kamer aan te tikken
(minder als de kamer minder objecten heeft). Dat gaat automatisch via `addObj`; deur en lift tellen niet mee.
Voor dingen die niet via `addObj` gaan: `earnSticker('<key>', node)`. Opgeslagen in `localStorage`
(`noor-prinses-stickers`).

## Een kamer toevoegen

1. `js/rooms/<key>.js` met `defineRoom({ key, name, icon, say, build(x) { ... } })`.
   Gebruik in `build` altijd `x + ...` voor posities; elders `roomX('<key>')`, `inRoom('<key>')` en `sceneOf('<key>')`.
2. Eventueel `css/rooms/<key>.css` met `.room.rm-<key> .wall` / `.floor`.
3. Voeg de key toe aan een verdieping in `WINGS` en de `<script>`/`<link>` aan `prinses.html`.
4. Zet de nieuwe bestanden in `PRECACHE_URLS` in `sw.js`.
5. Heeft de kamer een overlay? Voeg de `xxxOpen`-vlag toe aan `overlayOpen()` in `js/engine.js`.

Alle scripts zijn gewone (klassieke) scripts die dezelfde globale scope delen. Een bestand mag bij het laden
nog geen functies uit latere bestanden aanroepen; dat gebeurt pas in `main.js`.
