/* 🐱🐶 Voerbakjes in de kasteelhal: een kattenbak en een hondenbak, en de hond die in zijn mand ligt.
   Tik een bakje aan: de prinses schudt er brokjes in, de poes (waar ze ook is) of de hond komt eraan
   rennen en eet hap voor hap het bakje leeg. Daarna loopt de poes weer met je mee (als ze dat deed)
   en gaat de hond terug naar zijn mand. Gebruikt in kasteelhal.js (buildPetBowls) en engine.js (updateDog). */
const DOG = { x: 0, home: 0, goalX: null, arrive: null, facing: -1, eating: false };
const bowls = {};

function buildPetBowls(r0) {
    bowls.kat = addObj(`<div class="vb-bowl kat"><div class="vb-food"></div><span class="vb-face">🐱</span></div>`,
        r0 + 250, 418, r0 + 195, () => fillBowl('kat'));
    bowls.hond = addObj(`<div class="vb-bowl hond"><div class="vb-food"></div><span class="vb-face">🐶</span></div>`,
        r0 + 600, 414, r0 + 545, () => fillBowl('hond'));
    place(el('<div class="vb-mand"></div>'), r0 + 690, 410).classList.add('obj');
    const dog = el('<div class="dog" id="dog"><span class="dbob"><span class="dflip">🐕</span></span></div>');
    world.appendChild(dog);
    DOG.x = DOG.home = r0 + 748;
    dog.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (state.busy || DOG.eating) return;
        dogWoof();
        bounceEl(dog, 'jump');
        for (let i = 0; i < 12; i++) spawnSparkle(DOG.x, FEET_Y - 60, { hue: 30 + Math.random() * 20, speed: 110 });
    });
}

function dogWoof() {
    playFreqSweep(260, 180, 0.12, 0.25);
    setTimeout(() => playFreqSweep(280, 190, 0.14, 0.25), 220);
    speak('Woef woef!', { rate: 0.9, pitch: 0.6 });
}

// The princess shakes kibble into the bowl, then the animal comes running to eat it
function fillBowl(kind) {
    const bowl = bowls[kind];
    if (bowl.classList.contains('full') || state.busy) return;
    state.busy = true;
    const food = bowl.querySelector('.vb-food');
    food.innerHTML = Array.from({ length: 9 }, (_, i) =>
        `<i style="left:${8 + (i % 5) * 19 + (i > 4 ? 9 : 0)}%;top:${i > 4 ? 6 : 38}%;animation-delay:${i * 60}ms"></i>`).join('');
    bowl.classList.add('full');
    for (let i = 0; i < 9; i++) setTimeout(() => playTone(1400 + Math.random() * 900, 0.03, 0.05, 'triangle'), i * 60);
    setTimeout(() => {
        state.busy = false;
        if (kind === 'kat') callCat(); else callDog();
    }, 700);
}

function bowlCenter(kind) {
    return parseFloat(bowls[kind].style.left) + bowls[kind].offsetWidth / 2;
}

function callCat() {
    const pet = state.pet;
    if (pet.eating) return;
    const node = petEl();
    // She eats on the right side of her bowl, so the princess (on the left) doesn't hide her
    const target = bowlCenter('kat') + 52;
    speak('Poes! Eten!');
    // Not in the hall right now: she comes running in from the side
    if (pet.key !== scene.key) {
        world.appendChild(node);
        pet.key = scene.key;
        pet.x = state.camX - 60;
    }
    // While she eats she doesn't follow the princess; afterwards she does again if she did
    const wasFollowing = pet.following;
    pet.following = false;
    pet.eating = true;
    pet.goalX = target;
    pet.arrive = () => {
        pet.facing = -1;
        catMeow();
        munch('kat', petEl(), () => {
            pet.eating = false;
            pet.goalX = null;
            pet.following = wasFollowing;
            for (let i = 0; i < 16; i++) spawnSparkle(pet.x, FEET_Y - 50, { hue: 330, speed: 110 });
            playFreqSweep(200, 260, 0.6, 0.05);
        });
    };
}

function callDog() {
    speak('Kom maar, hond! Eten!');
    DOG.eating = true;
    DOG.goalX = bowlCenter('hond') + 55;
    DOG.arrive = () => {
        DOG.facing = -1;
        dogWoof();
        munch('hond', document.getElementById('dog'), () => {
            document.getElementById('dog').classList.add('wag');
            for (let i = 0; i < 16; i++) spawnSparkle(DOG.x, FEET_Y - 60, { hue: 30, speed: 110 });
            setTimeout(() => {
                document.getElementById('dog').classList.remove('wag');
                DOG.eating = false;
                DOG.goalX = DOG.home;
                DOG.arrive = () => { DOG.facing = -1; };
            }, 1800);
        });
    };
}

// Bite by bite: the kibble disappears, crunch, then hearts
function munch(kind, node, done) {
    const bowl = bowls[kind];
    node.classList.add('eating');
    const bits = [...bowl.querySelectorAll('.vb-food i')];
    bits.forEach((b, i) => setTimeout(() => {
        b.classList.add('gone');
        playTone(kind === 'kat' ? 900 + Math.random() * 300 : 300 + Math.random() * 150, 0.05, 0.12, 'square');
    }, 300 + i * 330));
    setTimeout(() => {
        node.classList.remove('eating');
        bowl.classList.remove('full');
        bowl.querySelector('.vb-food').innerHTML = '';
        const r = node.getBoundingClientRect();
        const p = screenToWorld(r.left + r.width / 2, r.top);
        for (let i = 0; i < 3; i++) {
            const h = el('<div class="magic-fly">💖</div>');
            h.style.position = 'absolute';
            h.style.left = (p.x - 16) + 'px';
            h.style.top = (p.y - 10) + 'px';
            h.style.setProperty('--dx', ((Math.random() - 0.5) * 100) + 'px');
            h.style.setProperty('--dy', (-70 - Math.random() * 50) + 'px');
            world.appendChild(h);
            setTimeout(() => h.remove(), 3300);
        }
        playCorrect();
        done();
    }, 600 + bits.length * 330);
}

// Walk an animal ({ x, goalX, arrive, facing }) towards its goal; true while it moves
function walkAnimal(a, dt, speed) {
    if (a.goalX == null) return false;
    const d = a.goalX - a.x;
    if (Math.abs(d) > 4) {
        a.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
        a.facing = Math.sign(d);
        return true;
    }
    if (a.arrive) {
        const f = a.arrive;
        a.arrive = null;
        f();
    }
    return false;
}

function updateDog(dt) {
    const node = document.getElementById('dog');
    if (!node) return;
    const moving = walkAnimal(DOG, dt, 300);
    if (!moving && DOG.goalX === DOG.home && !DOG.arrive) DOG.goalX = null;
    node.style.transform = `translate(${DOG.x - 45}px, ${FEET_Y - 72}px)`;
    node.classList.toggle('right', DOG.facing > 0);
    node.classList.toggle('walking', moving);
    node.classList.toggle('home', !moving && !DOG.eating && Math.abs(DOG.x - DOG.home) < 6);
}
