/* 👑 Grote slaapkamer van Mama en Papa (de koningin en de koning, zie js/parents.js) */
defineRoom({
    key: 'ouderslaapkamer',
    name: 'Grote slaapkamer',
    icon: '👑',
    say: 'De grote slaapkamer van mama en papa',
    build(x) {
        place(el('<div class="royal-portrait"><span>👸</span><span>🤴</span></div>'), x + 40, 90);
        place(el('<div class="fireplace"><div class="fire"></div></div>'), x + 640, 250);
        addObj(`<div class="big-bed">
            <div class="bb-post" style="left:0"></div><div class="bb-post" style="left:450px"></div>
            <div class="bb-canopy"></div>
            <div class="bb-curtain" style="left:-10px"></div><div class="bb-curtain" style="left:430px"></div>
            <div class="bb-head"><span>👑</span></div>
            <div class="bb-mattress"></div>
            <div class="bb-pillow" style="top:118px"></div><div class="bb-pillow" style="top:150px"></div>
            <div class="bb-blanket"></div>
            <div class="bb-leg" style="left:30px"></div><div class="bb-leg" style="left:420px"></div>
            <div class="tap-hint" style="left:215px;top:-44px">👇</div>
        </div>`, x + 160, 170, x + 120, parentsToBed);
        place(el('<div class="big-bed-cover" id="bigBedCover"></div>'), x + 384, 300);
        addObj('<div class="emoji-obj" style="font-size:44px">🧴</div>', x + 560, 300, x + 580, () => { playSparkleSound(); burst(x + 580, 310, 20); });
    }
});
