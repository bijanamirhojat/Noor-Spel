/* ─────────── Start ─────────── */
initScenes();
setScene('sea');
buildSea();
spawnGems();
setScene('dorp');
buildVillage();
spawnGems();
setScene('dierentuin');
buildZoo();
spawnGems();
setScene('ruimte');
buildSpace();
spawnGems();
setScene('wolken');
buildSky();
spawnGems();
setScene('out');
buildOutside();
spawnGems();
// Ground floor last: the princess starts in the hall
WINGS.slice().reverse().forEach(wing => {
    setScene(wing.key);
    buildWing(wing);
    spawnGems();
});
buildParents();
buildLights();
world.appendChild(el(`<div class="princess" id="princess"><div class="dancer"><div class="flip">${princessSVG('pr')}</div></div></div>`));
buildScope();
buildHands();
buildNailTools();
renderWallFrames();
renderRoomSnowman();
renderVitrine();
renderToyShelf();
renderPlushBasket();
updateStickerBtn();
loadLook();
applyLook();
// Only now: resize() also lays out overlays from files loaded after engine.js
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(playfield);
resize();
state.camX = Math.max(0, state.x - state.viewW / 2);
requestAnimationFrame(frame);
