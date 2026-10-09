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
world.appendChild(el(`<div class="princess" id="princess"><div class="dancer"><div class="flip">${princessSVG('pr')}</div></div></div>`));
buildScope();
buildHands();
buildNailTools();
renderWallFrames();
renderRoomSnowman();
renderVitrine();
renderToyShelf();
updateStickerBtn();
loadLook();
applyLook();
resize();
state.camX = Math.max(0, state.x - state.viewW / 2);
requestAnimationFrame(frame);
