/* ==========================================================================
   A LITTLE GARDEN FROM HEER - GAME & INTERACTIVE ENGINE
   Handles views, interactions, sound synthesis, bouquet building & personality
   ========================================================================== */

// --- Game State ---
const state = {
  gender: null,          // 'boy' or 'girl'
  pickedFlowers: [],     // Array of flower IDs (strings, max 6)
  maxFlowers: 6,
  hasOpenedBasket: false,
  soundMuted: false,
  currentCommentIndex: 0
};

// --- Flower Details & Trait Mapping ---
const flowersData = {
  rose: {
    name: "Rose",
    emoji: "🌹",
    trait: "Romantic",
    badgeColor: "#C93D4B",
    description: "You have a weakness for pretty things, cozy vibes, and meaningful gestures. You probably pretend you're not sentimental, but let's be honest... nobody is buying it. You care deeply, and your bouquet is a love note in disguise."
  },
  sunflower: {
    name: "Sunflower",
    emoji: "🌻",
    trait: "Sunny",
    badgeColor: "#F0B52B",
    description: "You gravitate toward warmth, optimism, and things that make people smile. Your flower choices basically walked into this virtual garden wearing dark sunglasses. You bring infectious energy wherever you go."
  },
  tulip: {
    name: "Tulip",
    emoji: "🌷",
    trait: "Elegant",
    badgeColor: "#E86E95",
    description: "You appreciate items that are beautifully balanced without trying too hard. You operate on the principle of 'minimal effort, maximum taste.' There is a natural, effortless symmetry in how you see the world."
  },
  daisy: {
    name: "Daisy",
    emoji: "🌼",
    trait: "Playful",
    badgeColor: "#F1C40F",
    description: "You picked flowers like you were choosing your favorite snacks—no rigid strategy, just pure wholesome vibes. You find beauty in simplicity and don't feel the need to overcomplicate the moments that make you happy."
  },
  lavender: {
    name: "Lavender",
    emoji: "🪻",
    trait: "Calm",
    badgeColor: "#9B5DE5",
    description: "You naturally seek out peaceful, soft, and comforting spaces. Your bouquet feels like it needs a warm cup of tea and a cozy blanket. You possess a soothing presence that helps ground the chaos around you."
  },
  hibiscus: {
    name: "Hibiscus",
    emoji: "🌺",
    badgeColor: "#FF4E50",
    trait: "Bold",
    description: "You clearly don't believe in boring, predictable choices. Your bouquet has entered the room, taken over, and declared itself the main character. You love vibrancy, confidence, and living out loud."
  },
  cherry: {
    name: "Cherry Blossom",
    emoji: "🌸",
    trait: "Dreamy",
    badgeColor: "#FDB3C8",
    description: "You notice the tiny, fleeting, beautiful details in life. Your bouquet looks like a nostalgic snapshot or a scene from a beautiful movie that hasn't been filmed yet. You're a soft-hearted idealist at heart."
  },
  blue: {
    name: "Blue Flower",
    emoji: "💠",
    trait: "Curious",
    badgeColor: "#00D2FC",
    description: "You like things that are slightly off the beaten path. Predictable was never really your style. You ask interesting questions, seek out unusual perspectives, and appreciate the quirky, hidden sides of people."
  },
  white: {
    name: "White Lily",
    emoji: "🤍",
    trait: "Minimalist",
    badgeColor: "#B0BEC5",
    description: "You understand that you don't need twenty elements to create something stunning—you just need the right ones. You have an eye for clean spaces, thoughtful boundaries, and understated elegance."
  },
  wild: {
    name: "Wildflower",
    emoji: "🌿",
    trait: "Free-spirited",
    badgeColor: "#A55EEA",
    description: "You love organic, natural, untamed vibes. Your selection represents a wild energy that refuses to be neatly organized or put into a standard box. You trust the process and roll with whatever comes."
  },
  hidden: {
    name: "Hidden Bud",
    emoji: "🌱",
    trait: "Mysterious",
    badgeColor: "#81C784",
    description: "You found the hidden flower! This means you pay close attention and notice quiet secrets that others sweep right past. You appreciate subtle, quiet magic and are comfortable with mystery."
  }
};

// --- Speech Bubble Comments ---
const countsComments = {
  0: "Click on the picnic basket to see what your mission is! 🧺",
  1: "Okay… we're starting. A fine first choice.",
  2: "Interesting. Let's see what else catches your eye.",
  3: "I see where this is going. Subtle patterns are emerging...",
  4: "OH. So this is your taste. Very telling.",
  5: "You are revealing a lot about yourself with this one.",
  6: "That's it. Step away from the flowers. You have officially been judged by a garden. 💐"
};

// --- Web Audio API Synth Engine ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (state.soundMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (type) {
    case 'click': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.12);
      break;
    }
    case 'pluck': {
      // Arpeggio pluck
      const notes = [440, 554.37, 659.25]; // A major chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + idx * 0.05 + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
      break;
    }
    case 'unpluck': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.18);
      break;
    }
    case 'rustle': {
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 1.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(now + 0.2);
      break;
    }
    case 'sparkle': {
      // Magic glitter sound sweep
      const length = 8;
      for (let i = 0; i < length; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = 523.25 * Math.pow(1.22, i); // ascending scale
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      }
      break;
    }
    case 'splash': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
      break;
    }
  }
}

// --- Petals Falling Animation Generator ---
function createPetals() {
  const container = document.getElementById('petal-container');
  const petalCount = 18;
  for (let i = 0; i < petalCount; i++) {
    spawnPetal(container, true);
  }
}

function spawnPetal(container, startRandom = false) {
  const petal = document.createElement('div');
  petal.classList.add('petal');
  
  // Random configurations
  const size = Math.random() * 8 + 8; // 8px to 16px
  const startX = Math.random() * 100; // 0% to 100% width
  const startY = startRandom ? Math.random() * -100 : -10; // offset top
  const duration = Math.random() * 10 + 10; // 10s to 20s
  const delay = Math.random() * -20; // negative delay so they start scattered
  const rotation = Math.random() * 360;
  
  petal.style.width = `${size}px`;
  petal.style.height = `${size * 1.2}px`;
  petal.style.left = `${startX}%`;
  petal.style.top = `${startY}%`;
  petal.style.transform = `rotate(${rotation}deg)`;
  petal.style.animation = `fallAndDrift ${duration}s linear infinite`;
  petal.style.animationDelay = `${delay}s`;
  
  // Random Ghibli colors (soft pinks, whites, yellows)
  const colors = ['#FDB3C8', '#FFF0F5', '#FFE0E9', '#FFF9C4', '#FFFFFF'];
  petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  
  container.appendChild(petal);
}

// Add CSS animation dynamically for falling petals
const petalStyle = document.createElement('style');
petalStyle.innerHTML = `
@keyframes fallAndDrift {
  0% {
    top: -5%;
    transform: translateX(0) rotate(0deg);
  }
  100% {
    top: 105%;
    transform: translateX(250px) rotate(720deg);
  }
}
`;
document.head.appendChild(petalStyle);


// --- Game Core Flow & Events ---
document.addEventListener('DOMContentLoaded', () => {
  createPetals();
  setupEventListeners();
  
  // Start cloud animations at offset to look natural
  const clouds = document.querySelectorAll('.cloud');
  clouds.forEach(c => {
    c.style.animationDelay = `${Math.random() * -40}s`;
  });
});

function setupEventListeners() {
  // Audio control toggle
  const audioToggle = document.getElementById('audio-toggle');
  audioToggle.addEventListener('click', () => {
    state.soundMuted = !state.soundMuted;
    audioToggle.classList.toggle('muted', state.soundMuted);
    playSound('click');
  });

  // INTRO FLOW
  const btnNextIntro = document.getElementById('btn-next-intro');
  const introStep1 = document.getElementById('intro-step-1');
  const introStep2 = document.getElementById('intro-step-2');
  const introStep3 = document.getElementById('intro-step-3');
  
  btnNextIntro.addEventListener('click', () => {
    playSound('click');
    introStep1.classList.add('hidden');
    introStep2.classList.remove('hidden');
  });

  const genderBoy = document.getElementById('gender-boy');
  const genderGirl = document.getElementById('gender-girl');
  const noteBoy = document.getElementById('note-boy');
  const noteGirl = document.getElementById('note-girl');

  genderBoy.addEventListener('click', () => {
    state.gender = 'boy';
    playSound('click');
    noteBoy.classList.remove('hidden');
    noteGirl.classList.add('hidden');
    transitionToPersonalizedNote();
  });

  genderGirl.addEventListener('click', () => {
    state.gender = 'girl';
    playSound('click');
    noteGirl.classList.remove('hidden');
    noteBoy.classList.add('hidden');
    transitionToPersonalizedNote();
  });

  function transitionToPersonalizedNote() {
    introStep2.classList.add('hidden');
    introStep3.classList.remove('hidden');
  }

  const btnStartGame = document.getElementById('btn-start-game');
  const introView = document.getElementById('intro-view');
  const gardenView = document.getElementById('garden-view');

  btnStartGame.addEventListener('click', () => {
    playSound('rustle');
    introView.classList.remove('active');
    gardenView.classList.add('active');
    
    // Auto-trigger picnic basket mission after 1.5 seconds if they haven't clicked it
    setTimeout(() => {
      if (!state.hasOpenedBasket) {
        openModal(document.getElementById('modal-basket'));
        state.hasOpenedBasket = true;
      }
    }, 1500);
  });

  // --- GARDEN INTERACTIVE ELEMENTS ---
  
  // Pond ripple on click
  const pond = document.querySelector('.pond');
  pond.addEventListener('click', (e) => {
    playSound('splash');
    // Create immediate ripple effect at pointer click relative to pond
    const rect = pond.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Inject dynamic SVG ripple inside pond
    const svg = pond.querySelector('svg');
    const newRipple = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    newRipple.setAttribute('cx', x * (200 / rect.width)); // translate to viewBox scale
    newRipple.setAttribute('cy', y * (120 / rect.height));
    newRipple.setAttribute('rx', '2');
    newRipple.setAttribute('ry', '1');
    newRipple.setAttribute('fill', 'none');
    newRipple.setAttribute('stroke', '#FFFFFF');
    newRipple.setAttribute('stroke-width', '1.5');
    newRipple.classList.add('pond-ripple');
    newRipple.style.animation = 'ripple-expand 2s ease-out forwards';
    
    svg.appendChild(newRipple);
    setTimeout(() => newRipple.remove(), 2000);
    
    updateHeerSpeech("“Brr, that water is chilly! Looks like you made a splash.”");
  });

  // Signboards dialogue responses
  const signpost1 = document.getElementById('signpost-1');
  const signpost2 = document.getElementById('signpost-2');

  signpost1.addEventListener('click', () => {
    playSound('rustle');
    signpost1.style.animation = 'wiggle-rotate 0.5s ease-in-out';
    setTimeout(() => signpost1.style.animation = '', 500);
    updateHeerSpeech("“I worked hard planting this! Keep your heavy boots off the seedlings.”");
  });

  signpost2.addEventListener('click', () => {
    playSound('rustle');
    signpost2.style.animation = 'wiggle-rotate 0.5s ease-in-out';
    setTimeout(() => signpost2.style.animation = '', 500);
    updateHeerSpeech("“Every flower you pick reveals your true colors. Don't rush it.”");
  });

  // Picnic basket note trigger
  const basketTrigger = document.getElementById('basket-trigger');
  basketTrigger.addEventListener('click', () => {
    playSound('click');
    openModal(document.getElementById('modal-basket'));
    state.hasOpenedBasket = true;
  });

  document.getElementById('btn-close-basket-note').addEventListener('click', () => {
    playSound('click');
    closeModal(document.getElementById('modal-basket'));
  });
  document.getElementById('close-basket-modal').addEventListener('click', () => {
    closeModal(document.getElementById('modal-basket'));
  });

  // Polaroid image trigger
  const polaroidTrigger = document.getElementById('polaroid-trigger');
  polaroidTrigger.addEventListener('click', () => {
    playSound('click');
    openModal(document.getElementById('modal-polaroid'));
  });
  document.getElementById('close-polaroid-modal').addEventListener('click', () => {
    closeModal(document.getElementById('modal-polaroid'));
  });

  // Avatar speech trigger
  document.getElementById('avatar-trigger').addEventListener('click', () => {
    playSound('click');
    // Display a random cute handwritten message from Heer
    const responses = [
      "“I hope you like what I made for you.”",
      "“Okay wait… that blue flower is actually cute.”",
      "“Interesting choices so far…”",
      "“I would have picked that lavender too.”",
      "“You're taking this very seriously, huh?”",
      "“Did you find the secret golden bud yet? 👀”",
      "“Yes, I am secretly judging your taste. Pick wisely.”"
    ];
    const rand = responses[Math.floor(Math.random() * responses.length)];
    updateHeerSpeech(rand);
  });

  // --- FLOWER FIELD MECHANICS ---
  const flowers = document.querySelectorAll('.garden-flower');
  flowers.forEach(flower => {
    flower.addEventListener('click', () => {
      const id = flower.getAttribute('data-id');
      toggleFlowerSelection(id, flower);
    });
  });

  // HUD Slots clicks (clicking flower in HUD removes it)
  const slots = document.querySelectorAll('.bouquet-slot');
  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      if (slot.classList.contains('filled')) {
        const id = slot.getAttribute('data-id');
        const origFlower = document.querySelector(`.flower-${id}`);
        toggleFlowerSelection(id, origFlower);
      }
    });
  });

  // --- REVEAL / SUBMIT BOUQUET ---
  const btnRevealBouquet = document.getElementById('btn-reveal-bouquet');
  const btnProceedReveal = document.getElementById('btn-proceed-reveal');
  const bouquetView = document.getElementById('bouquet-view');

  btnRevealBouquet.addEventListener('click', () => {
    playSound('sparkle');
    gardenView.classList.remove('active');
    bouquetView.classList.add('active');
    triggerBouquetAssembly();
  });

  btnProceedReveal.addEventListener('click', () => {
    playSound('click');
    document.getElementById('assembly-arena').classList.add('hidden');
    document.getElementById('results-panel').classList.remove('hidden');
    renderPersonalityAndLetter();
  });

  // --- FINAL SCREEN CONTROL ACTIONS ---
  document.getElementById('btn-action-picnic').addEventListener('click', () => {
    playSound('rustle');
    bouquetView.classList.remove('active');
    gardenView.classList.add('active');
    
    // Place the bouquet graphics visual on the picnic blanket!
    renderBouquetOnBlanket();
  });

  document.getElementById('btn-action-letter').addEventListener('click', () => {
    playSound('click');
    openModal(document.getElementById('modal-letter'));
  });
  
  document.getElementById('close-letter-modal').addEventListener('click', () => {
    closeModal(document.getElementById('modal-letter'));
  });
  
  document.getElementById('btn-close-letter-modal').addEventListener('click', () => {
    closeModal(document.getElementById('modal-letter'));
  });

  document.getElementById('btn-action-reset').addEventListener('click', () => {
    playSound('rustle');
    resetGame();
  });
}

// --- Core Helper Game Methods ---

function updateHeerSpeech(text) {
  const speechText = document.getElementById('heer-speech');
  speechText.style.opacity = 0;
  setTimeout(() => {
    speechText.innerText = text;
    speechText.style.opacity = 1;
  }, 200);
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

// --- Flower Picking Logic ---
function toggleFlowerSelection(id, flowerElement) {
  const index = state.pickedFlowers.indexOf(id);
  
  if (index > -1) {
    // Flower is already selected, so DE-SELECT / REMOVE
    state.pickedFlowers.splice(index, 1);
    flowerElement.classList.remove('plucked');
    playSound('unpluck');
    
    // Update HUD
    updateHUDTracker();
    updateHeerSpeech(`“Removed the ${flowersData[id].name}. Changed your mind?”`);
  } else {
    // Flower is NOT selected, check if we have space (Max 6)
    if (state.pickedFlowers.length >= state.maxFlowers) {
      playSound('unpluck');
      updateHeerSpeech("“That's it. Step away from the flowers! Exactly 6, please.”");
      
      // Temporary warning flash on the counter
      const counter = document.getElementById('flower-counter');
      counter.style.backgroundColor = '#C93D4B';
      setTimeout(() => counter.style.backgroundColor = '', 400);
      return;
    }
    
    // SELECT / PLUCK
    state.pickedFlowers.push(id);
    flowerElement.classList.add('plucked');
    playSound('pluck');
    
    // Create beautiful local click sparkle bursts
    createSparkleBurst(flowerElement);
    
    // Update HUD
    updateHUDTracker();
    
    // Heer comments based on flower counts
    const count = state.pickedFlowers.length;
    updateHeerSpeech(countsComments[count]);
  }
}

// HUD Visual update
function updateHUDTracker() {
  const counterText = document.getElementById('flower-counter');
  counterText.innerText = `${state.pickedFlowers.length} / ${state.maxFlowers}`;
  
  const slots = document.querySelectorAll('.bouquet-slot');
  slots.forEach((slot, idx) => {
    slot.innerHTML = '';
    slot.className = 'bouquet-slot';
    slot.removeAttribute('data-id');
    
    if (idx < state.pickedFlowers.length) {
      const flowerId = state.pickedFlowers[idx];
      slot.classList.add('filled');
      slot.setAttribute('data-id', flowerId);
      
      // Clone flower bloom SVG and inject into the slot
      const origFlower = document.querySelector(`.flower-${flowerId}`);
      if (origFlower) {
        const svgClone = origFlower.querySelector('svg').cloneNode(true);
        svgClone.style.transform = 'none';
        slot.appendChild(svgClone);
      }
    }
  });

  // Enable/Disable submit button
  const submitBtn = document.getElementById('btn-reveal-bouquet');
  if (state.pickedFlowers.length === state.maxFlowers) {
    submitBtn.classList.remove('btn-disabled');
    submitBtn.classList.add('btn-primary');
    submitBtn.disabled = false;
  } else {
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-disabled');
    submitBtn.disabled = true;
  }
}

function createSparkleBurst(flowerElement) {
  const rect = flowerElement.getBoundingClientRect();
  const body = document.body;
  
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    sparkle.innerText = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.fontSize = `${Math.random() * 0.8 + 0.8}rem`;
    sparkle.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
    sparkle.style.top = `${rect.top + rect.height / 2 + window.scrollY}px`;
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    
    body.appendChild(sparkle);
    
    // Spread coordinates
    const angle = (i / 8) * Math.PI * 2;
    const distance = Math.random() * 40 + 30;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    
    setTimeout(() => {
      sparkle.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
      sparkle.style.opacity = '0';
    }, 20);
    
    setTimeout(() => sparkle.remove(), 700);
  }
}


// --- Bouquet Assembly Theater Animation ---
function triggerBouquetAssembly() {
  const container = document.getElementById('flying-flowers-container');
  container.innerHTML = '';
  
  const target = document.getElementById('bouquet-target');
  const targetRect = target.getBoundingClientRect();
  
  const proceedBtn = document.getElementById('btn-proceed-reveal');
  proceedBtn.style.display = 'none';
  
  // Show flowers flying toward center
  state.pickedFlowers.forEach((flowerId, idx) => {
    const flowerDiv = document.createElement('div');
    flowerDiv.className = 'flying-flower-asset';
    
    // Clone original SVG
    const origFlower = document.querySelector(`.flower-${flowerId}`);
    if (origFlower) {
      flowerDiv.appendChild(origFlower.querySelector('svg').cloneNode(true));
    }
    
    // Start scatter positions around the screen
    const angle = (idx / state.maxFlowers) * Math.PI * 2;
    const radius = 250; // scatter radius
    const startX = window.innerWidth / 2 + Math.cos(angle) * radius - 22;
    const startY = window.innerHeight / 2 + Math.sin(angle) * radius - 33;
    
    flowerDiv.style.left = `${startX}px`;
    flowerDiv.style.top = `${startY}px`;
    document.body.appendChild(flowerDiv);
    
    // Trigger flying to central target coordinates
    setTimeout(() => {
      const tX = targetRect.left + targetRect.width / 2 - 22 + window.scrollX;
      const tY = targetRect.top + targetRect.height / 2 - 33 + window.scrollY;
      
      flowerDiv.style.transform = `translate(${tX - startX}px, ${tY - startY}px) scale(1.1) rotate(${idx * 15}deg)`;
    }, 100 + idx * 250);
    
    // Clean up flying elements
    setTimeout(() => {
      flowerDiv.remove();
    }, 2500);
  });

  // Trigger burst effects and ribbon wrap after fly ends
  setTimeout(() => {
    playSound('sparkle');
    document.querySelector('.bouquet-sparkle-burst').classList.add('burst');
    document.querySelector('.ribbon-draw').classList.add('active');
  }, 1800);

  // Show Proceed button
  setTimeout(() => {
    proceedBtn.style.display = 'block';
    proceedBtn.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }, 2200);
}


// --- Personality Scoring & Letter Renderer ---
function renderPersonalityAndLetter() {
  // 1. Compile final fanned bouquet graphics
  renderFinalBouquet();
  
  // 2. Count traits frequencies
  const traitsCount = {};
  state.pickedFlowers.forEach(id => {
    const trait = flowersData[id].trait;
    traitsCount[trait] = (traitsCount[trait] || 0) + 1;
  });
  
  // Sort traits by highest frequency
  const sortedTraits = Object.keys(traitsCount).sort((a, b) => traitsCount[b] - traitsCount[a]);
  const primaryTrait = sortedTraits[0];
  
  // Generate list elements of selected traits
  const traitsList = document.getElementById('personality-traits-list');
  traitsList.innerHTML = '';
  
  // Map out descriptors
  sortedTraits.forEach(traitName => {
    // Find matching flower data for description
    let flowerMatch = null;
    for (const key in flowersData) {
      if (flowersData[key].trait === traitName) {
        flowerMatch = flowersData[key];
        break;
      }
    }
    
    if (flowerMatch) {
      const traitCount = traitsCount[traitName];
      const percent = Math.round((traitCount / 6) * 100);
      
      const item = document.createElement('div');
      item.className = 'trait-item';
      item.innerHTML = `
        <div class="trait-title-row">
          <span class="trait-badge" style="background-color: ${flowerMatch.badgeColor}">${traitName}</span>
          <span class="trait-score">${traitCount} / 6 (${percent}%)</span>
        </div>
        <p class="trait-desc">${flowerMatch.description}</p>
      `;
      traitsList.appendChild(item);
    }
  });

  // 3. Assemble dynamic handwriting note from Heer
  const letterTextContainer = document.getElementById('heer-letter-text');
  const modalLetterContainer = document.getElementById('modal-letter-text');
  
  // Personalize comment lines depending on primary trait and selected gender
  let traitComment = "";
  switch (primaryTrait) {
    case 'Romantic':
      traitComment = "I knew you were secretly sentimental, by the way. You pretend to be all tough, but look at all those romantic choices.";
      break;
    case 'Sunny':
      traitComment = "Your choices are basically rays of pure sunshine. I love how warm and optimistic your bouquet feels.";
      break;
    case 'Elegant':
      traitComment = "It feels incredibly tasteful and clean. Minimal effort, maximum class. I respect that.";
      break;
    case 'Playful':
      traitComment = "Honestly, it looks like you just picked flowers like they were sweets. Zero strategy, 100% vibes. Super cute.";
      break;
    case 'Calm':
      traitComment = "It feels so peaceful and soothing. Your bouquet basically looks like it needs a warm chamomile tea, which is very cozy.";
      break;
    case 'Bold':
      traitComment = "Woah, okay. Your choices made a huge statement. No boring options here—you chose things that capture attention.";
      break;
    case 'Dreamy':
      traitComment = "It has a super dreamy, starry aesthetic. It's like a soft pastel scene from a movie we haven't filmed yet.";
      break;
    case 'Curious':
      traitComment = "You picked the rare and unique flowers. It proves that predictable is never really your thing.";
      break;
    case 'Minimalist':
      traitComment = "It's so balanced and simple. You don't need excessive clutter to make something look absolutely beautiful.";
      break;
    case 'Free-spirited':
      traitComment = "It's organic, wild, and natural. Your bouquet has this cool, untamed energy that defies standard borders.";
      break;
    case 'Mysterious':
      traitComment = "You actually searched out the hidden golden bud! You notice the tiny magic details that most people completely miss.";
      break;
    default:
      traitComment = "It is uniquely yours, a complete blend of different styles.";
  }

  // Wording checks for boys/girls
  let genderComment = "";
  if (state.gender === 'boy') {
    genderComment = "See? You actually made something pretty. I knew you wouldn't mess it up. 😉";
  } else {
    genderComment = "Mission accomplished. I think your design tastes are absolutely beautiful.";
  }

  const finalLetterHTML = `
    <p>Okay...</p>
    <p>I think I understand your flower taste now.</p>
    <p>${traitComment}</p>
    <p>${genderComment}</p>
    <p>I made this little garden for you because I wanted to create a small virtual world that was completely yours, rather than just another boring webpage.</p>
    <p>So keep this bouquet. You selected every single petal yourself, and it fits you perfectly.</p>
  `;

  letterTextContainer.innerHTML = finalLetterHTML;
  modalLetterContainer.innerHTML = finalLetterHTML;
}

// Vector rendering of the bouquet SVG fan
function renderFinalBouquet() {
  const container = document.getElementById('final-bouquet-graphics');
  container.innerHTML = '';
  
  let svgHTML = `<svg viewBox="0 0 200 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  
  // 1. Draw Stems merging at center
  const fannedX = [60, 80, 100, 120, 140, 100];
  const fannedY = [110, 85, 75, 85, 110, 130];
  
  fannedX.forEach((x, idx) => {
    svgHTML += `<path d="M ${x} ${fannedY[idx] + 25} Q 100 180 100 240 L 100 285" fill="none" stroke="#4C6E43" stroke-width="3" stroke-linecap="round"/>`;
  });
  
  // 2. Render each of the 6 selected flowers
  state.pickedFlowers.forEach((flowerId, idx) => {
    const origFlower = document.querySelector(`.flower-${flowerId}`);
    if (origFlower) {
      const bloomGroup = origFlower.querySelector('.flower-bloom').outerHTML;
      const angle = -35 + idx * 14; 
      const scale = 0.8;
      const x = fannedX[idx] - 25; 
      const y = fannedY[idx] - 25;
      
      svgHTML += `<g transform="translate(${x}, ${y}) scale(${scale}) rotate(${angle}, 25, 25)">
        ${bloomGroup}
      </g>`;
    }
  });
  
  // 3. Draw leaves and satin ribbon bow
  svgHTML += `
    <!-- Leaves -->
    <path d="M 85 180 Q 50 160 65 135 Q 80 155 90 180 Z" fill="#5F8F54" stroke="#4C6E43" stroke-width="1.5"/>
    <path d="M 115 180 Q 150 160 135 135 Q 120 155 110 180 Z" fill="#5F8F54" stroke="#4C6E43" stroke-width="1.5"/>
    
    <!-- Satin Ribbon Bow -->
    <g stroke="#4A403A" stroke-width="2">
      <!-- Ribbon bow loops -->
      <path d="M 100 240 Q 80 215 82 240 Q 84 250 100 240 Z" fill="#F495B4"/>
      <path d="M 100 240 Q 120 215 118 240 Q 116 250 100 240 Z" fill="#F495B4"/>
      <!-- Ribbon tails -->
      <path d="M 98 242 Q 78 270 72 285 Q 83 280 94 242 Z" fill="#F495B4"/>
      <path d="M 102 242 Q 122 270 128 285 Q 117 280 106 242 Z" fill="#F495B4"/>
      <!-- Center Knot -->
      <circle cx="100" cy="240" r="7" fill="#D76B8E"/>
    </g>
  `;
  
  svgHTML += `</svg>`;
  container.innerHTML = svgHTML;
}

// Places a small version of the final bouquet on the picnic blanket
function renderBouquetOnBlanket() {
  const picnicBlanket = document.querySelector('.picnic-blanket');
  
  // Remove existing bouquet if there is one
  const oldBouquet = document.getElementById('blanket-bouquet');
  if (oldBouquet) oldBouquet.remove();
  
  const bouquetDiv = document.createElement('div');
  bouquetDiv.id = 'blanket-bouquet';
  bouquetDiv.style.position = 'absolute';
  bouquetDiv.style.bottom = '10px';
  bouquetDiv.style.right = '10px';
  bouquetDiv.style.width = '60px';
  bouquetDiv.style.height = '80px';
  bouquetDiv.style.zIndex = '7';
  bouquetDiv.style.transform = 'rotate(-15deg)';
  bouquetDiv.style.cursor = 'pointer';
  bouquetDiv.style.pointerEvents = 'auto';
  bouquetDiv.title = "Your beautiful bouquet lying on the blanket! Click to view it. 💐";
  
  // Create simple mini SVG rendering of the bouquet
  let svgHTML = `<svg viewBox="0 0 200 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
  
  // stems
  svgHTML += `<path d="M 100 120 L 100 250" stroke="#4C6E43" stroke-width="8" stroke-linecap="round"/>`;
  
  // flower bubbles
  state.pickedFlowers.forEach((id, idx) => {
    const colors = {
      rose: '#C93D4B', sunflower: '#F0B52B', tulip: '#E86E95', daisy: '#F1C40F',
      lavender: '#9B5DE5', hibiscus: '#FF4E50', cherry: '#FDB3C8', blue: '#00D2FC',
      white: '#FFFFFF', wild: '#A55EEA', hidden: '#FFE082'
    };
    const angle = (idx / 6) * Math.PI * 2;
    const cx = 100 + Math.cos(angle) * 35;
    const cy = 100 + Math.sin(angle) * 35;
    svgHTML += `<circle cx="${cx}" cy="${cy}" r="25" fill="${colors[id]}" stroke="#4A403A" stroke-width="4"/>`;
  });
  
  // ribbon
  svgHTML += `<circle cx="100" cy="180" r="14" fill="#F495B4" stroke="#4A403A" stroke-width="4"/>`;
  svgHTML += `</svg>`;
  
  bouquetDiv.innerHTML = svgHTML;
  picnicBlanket.appendChild(bouquetDiv);
  
  // Clicking the blanket bouquet returns to results panel
  bouquetDiv.addEventListener('click', () => {
    playSound('sparkle');
    document.getElementById('garden-view').classList.remove('active');
    document.getElementById('bouquet-view').classList.add('active');
    document.getElementById('assembly-arena').classList.add('hidden');
    document.getElementById('results-panel').classList.remove('hidden');
  });
}

// Reset Game
function resetGame() {
  state.pickedFlowers = [];
  state.hasOpenedBasket = true;
  
  // Remove plucked styles from garden flowers
  const flowers = document.querySelectorAll('.garden-flower');
  flowers.forEach(f => f.classList.remove('plucked'));
  
  // Reset HUD
  updateHUDTracker();
  updateHeerSpeech("“All clean! Let's start picking again. Show me your taste.”");
  
  // Reset bouquet visual on blanket
  const oldBouquet = document.getElementById('blanket-bouquet');
  if (oldBouquet) oldBouquet.remove();
  
  // Switch view panels back to garden
  document.getElementById('bouquet-view').classList.remove('active');
  document.getElementById('results-panel').classList.add('hidden');
  document.getElementById('assembly-arena').classList.remove('hidden');
  document.querySelector('.bouquet-sparkle-burst').classList.remove('burst');
  document.querySelector('.ribbon-draw').classList.remove('active');
  document.getElementById('garden-view').classList.add('active');
}
