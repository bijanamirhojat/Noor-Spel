# Prinsessenkasteel

`games/prinses.html` is alleen de pagina-schil: HUD, de overlays (HTML) en de `<link>`/`<script>`-tags.
De code staat in deze map.

## Indeling

```
js/core.js      constanten, state, prinses-SVG (met kapsels), look, el/place/addObj
js/overlay.js   overlay-register (registerOverlay, overlayOpen, Escape) en hulpjes in overlays (ovFly, ovCheer, bounceEl, near)
js/audio.js     geluiden die meerdere kamers gebruiken (startNoise/stopNoise, playLullaby)
js/world.js     kamer-register (defineRoom), WINGS (verdiepingen), scenes, setScene, deur
js/engine.js    edelstenen, bewegen, glitter, camera/main loop, tweens, poes
js/wand.js      toverstaf-spreuken
js/outside.js   buiten: plein, tuin, vijver, eenhoorn, speeltuin, theehuis, meer + bootje
js/piraten.js   piratenbaai (achter het meer, alleen met het bootje): piratenschip + avontuur (verrekijker, varen, schatkaart, graven)
js/unicornstyle.js  eenhoorn-verkleedkist: de look van de eenhoorn (unicornSVG in outside.js)
js/sea.js       onder water
js/village.js   het dorp: huisjes, koets
js/kaartjes.js  kaartjes voor koets, trein, bootje, bus en raket: kaartjesautomaat (addTicketMachine, bij elk vertrekpunt),
                needTicket(type, node, go) knipt een kaartje of wijst naar de automaat; bewaard in noor-prinses-kaartjes
js/dorp/*.js    dorpsplein, markt (boodschappen + betalen), ijssalon (ijsjes maken), bloemenwinkel (boeket voor Mama), kinderboerderij (eieren rapen),
                station (filmische treinrit langs het hele koninkrijk), spookhuis (spookjes zoeken met de zaklamp),
                moestuin (zaaien, water geven, oogsten), pluktuin (bloemen plukken voor een boeket),
                vlinderkas (rupsjes voeren, cocon, vlinders laten uitkomen),
                kermis (eendjes vissen, grijpmachine, suikerspin, reuzenrad),
                strand (hooghouden met de strandbal; de zeehond kopt hem terug)
js/dierentuin.js   de dierentuin: bus (addBus, vanaf het strand), dierengeluiden, zooToss/zooAnim
js/dierentuin/*.js ingang, apenhuis, savanne (voederkar: "Wie eet wat?"), pinguins, olifanten
js/ruimte.js       de ruimte: raket (addRocket), poezenplaneten (catPlanetHTML), miauw/spinnen
js/ruimte/*.js     maan, spiraal (erin = ergens anders in de ruimte uitkomen), poezenplaneten ("Poesjes naar huis"),
                   ruimtehaven (ruimtereis: sterrenkaart → zelf de raket sturen → landen op 6 planeten + paspoort)
js/sky.js       het wolkenrijk: gouden wolk buiten, aankomst, regenboogglijbaan terug
js/wolken/*.js  wolkenpoort, weermakerij (weer maken), wolkenkasteel (wolkjes kijken), regenboogmakerij (regenboog schilderen), raketwolk (raket naar de ruimte)
js/rooms/*.js   één bestand per kamer: defineRoom({ key, name, icon, build(x) }) + de activiteit
                js/rooms/pyjama.js: "Klaar voor bed" vanuit de kledingkast in de slaapkamer (uitkleden, opruimen in de wasmand,
                pyjama aan, naar bed); de pyjama zit in de prinses-SVG (.pjt/.pjp/.pjc) en gaat aan met klassen pj-* op .princess
                js/rooms/werkkamer.js: computer om op te "werken" (mailtjes beantwoorden, woordjes typen, videobellen); Papa werkt er soms zelf (parentStartWork in js/parents.js)
                js/rooms/ranjakamer.js: ranja maken (siroopjes kiezen = kleuren mengen, water, roeren, ijs, opdrinken)
                js/rooms/smoothiebar.js: smoothies maken (fruit + melk/yoghurt in de blender, mixknop ingedrukt houden, inschenken, toppings)
                js/rooms/kristalgrot.js: geheime grot onder het kasteel: kristallen die muziek maken, hartjeskristallen,
                schatkisten uitgraven door de aarde weg te vegen (canvas); gevonden schatten in noor-prinses-grotschatten
                js/rooms/legokamer.js: bouwen met legosteentjes (kleur kiezen, slepen of tikken; steentjes vallen op elkaar,
                oppakken en eraf slepen kan ook); het bouwwerk staat in noor-prinses-lego en in het klein op de tafel
                js/rooms/basketbal.js: basketbal (omhoog vegen of tikken, de worp wordt flink bijgestuurd; elke 5 keer raak
                verhuist de basket); het totaal staat in noor-prinses-basket en op het scorebord in de kamer
                js/rooms/troetelberen.js: in elke andere kamer gluurt een troetelbeer achter een ding vandaan (hideCareBears,
                plek vanzelf gekozen, anders BEAR_SPOTS); gevonden beren staan op de planken hier en in noor-prinses-troetelberen;
                alle beren thuis? de 🙈-knop verstopt ze weer
                js/rooms/halloween.js: pompoenen uitsnijden (ogen, neus en mond kiezen, kaarsje aan), snoepschaal, vliegende
                heksenbezem, spinnetje; de laatste 3 pompoenen staan op het trapje en in noor-prinses-pompoenen
js/parents.js   Mama en Papa (koningin en koning): lopen rond, nemen de lift, zingen bij het bed
js/lights.js    dag en nacht (vanzelf, of met de ☀️/🌙-knop; slapen = nacht) en een lamp in elke kasteelkamer
                (tik erop of de 💡-lichtknop); lampX in defineRoom kiest de plek van de lamp
js/map.js       toverlift + kaart
js/stickers.js  stickerboek
js/main.js      alles opbouwen en starten

css/tokens.css  lagen (--z-hud, --z-overlay, --z-modal, ...) en de hoofdkleuren (--pink-400, --amber-200, ...)
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

## Dierentuin

Een eigen wereld (`ZOO` in `js/world.js`, scene `dierentuin`). De dierentuinbus staat op het strand aan het eind
van het dorp (`scene.rides.dierentuin`) en bij de ingang (`scene.koets`, terug naar het dorp). `rideCarriage`
zet je neer bij het voertuig in de nieuwe wereld dat terug gaat naar waar je vandaan kwam (`scene.rides[van]`, anders `scene.koets`).

## Wolken

Nog een eigen wereld (`SKY` in `js/world.js`, scene `wolken`). Boven de eenhoornweide hangt een gouden wolk
(`buildCloudPortal`, `PORTAL_X` in `js/sky.js`); vlieg er met de eenhoorn tegenaan om naar boven te gaan.
Terug via de regenboogglijbaan op de wolkenpoort. Op de kaart zweven de wolken boven het kasteel.

## Ruimte

Een eigen wereld (`SPACE` in `js/world.js`, scene `ruimte`). De raket staat op de raketwolk (laatste wolkenplek,
`scene.rides.ruimte`) en op de maan (`scene.koets`, terug naar de wolken). In de ruimte zweeft de prinses net als onder
water (`floatyScene()` in `js/engine.js`) en draagt ze een astronautenhelm (klasse `astronaut`).

## Stickerboek

Elke kamer heeft een sticker (het kamer-icoon). Je verdient hem door een hoofdactiviteit te doen
(een object met een `.tap-hint` 👇) of door 3 verschillende objecten in die kamer aan te tikken
(minder als de kamer minder objecten heeft). Dat gaat automatisch via `addObj`; deur en lift tellen niet mee.
Een vol boek ruil je in voor een trofee (`tradeStickers` in `js/rooms/trofeekamer.js`, opgeslagen in
`noor-prinses-trofeeen`); daarna begint het boek weer leeg.
Voor dingen die niet via `addObj` gaan: `earnSticker('<key>', node)`. Opgeslagen in `localStorage`
(`noor-prinses-stickers`).

## Een kamer toevoegen

1. `js/rooms/<key>.js` met `defineRoom({ key, name, icon, say, build(x) { ... } })`.
   Gebruik in `build` altijd `x + ...` voor posities; elders `roomX('<key>')`, `inRoom('<key>')` en `sceneOf('<key>')`.
   Optioneel: `onEnter()` / `onLeave()` (binnenlopen en weggaan) en `tick(dt, now)` (elke frame zolang de wereld
   van de kamer actief is), bijv. muziek in de balzaal of de spiegel die meebeweegt.
2. Eventueel `css/rooms/<key>.css` met `.room.rm-<key> .wall` / `.floor`.
3. Voeg de key toe aan een verdieping in `WINGS` en de `<script>`/`<link>` aan `prinses.html`.
4. Zet de nieuwe bestanden in `PRECACHE_URLS` in `sw.js`.
5. Heeft de kamer een overlay? Zet direct onder de vlag `registerOverlay(() => xxxOpen, closeXxx);`
   (dan weet `overlayOpen()` ervan en sluit Escape hem).
6. Draai `npm test` (bestandscontrole, lint en de smoketest die elke kamer en activiteit afloopt).

Alle scripts zijn gewone (klassieke) scripts die dezelfde globale scope delen. Een bestand mag bij het laden
nog geen functies uit latere bestanden aanroepen; dat gebeurt pas in `main.js`.
