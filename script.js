/* =========================================================
   STEP 1: CUSTOMISE HERE
   Change the values below, save the file (Ctrl + S),
   and the page updates. Keep the quotes "  " around text.
   ========================================================= */
   const CONFIG = {
    name: "ISSAC SAMUEL",                 // birthday person's name
    age: 26,                        // shows "Cheers to 25 wonderful years!" (use null to hide)
    candles: 5,                     // candles on the cake (1 to 10)
  
    photo: "photo.jpg",             // photo file in the same folder ("" for none)
    music: "music.mp3",             // song file in the same folder ("" for none)
    musicStartAt: 4,                // start the song from this second
  
    // Use \n for a new line
    message:
     "Happy birthday to the love of my life! ❤️\n" +
    "Every moment with you is special and I am so lucky to have you.\n" +
    "I love you more than words can say. ❤️",

from: "With love, Monica",      // signature under the message
  
    colors: ["#ff4f9a", "#ffd166", "#06d6a0", "#4cc9f0", "#b388ff", "#ff7b54"],
    typingSpeed: 45                 // smaller = faster typing
  };
  
  /* =========================================================
     You do not need to change anything below this line.
     ========================================================= */
  
  const $ = (id) => document.getElementById(id);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  
  const intro      = $("intro");
  const party      = $("party");
  const giftBtn    = $("giftBtn");
  const cake       = $("cake");
  const candlesBox = $("candles");
  const cakeHint   = $("cakeHint");
  const card       = $("messageCard");
  const messageEl  = $("message");
  const signature  = $("signature");
  const replayBtn  = $("replayBtn");
  const musicBtn   = $("musicBtn");
  const song       = $("song");
  
  let candlesOut = false;
  let typingTimer = null;
  
  /* ---------- Fill the page with CONFIG values ---------- */
  function applyConfig() {
    document.title = "Happy Birthday, " + CONFIG.name + "!";
    document.querySelectorAll(".js-name").forEach((el) => (el.textContent = CONFIG.name));
  
    // Title: "Happy Birthday" letters wave, name pops in below
    const title = $("title");
    title.innerHTML = "";
    const line = document.createElement("span");
    line.className = "line";
    [..."Happy Birthday"].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "letter";
      s.textContent = ch === " " ? " " : ch;
      s.style.setProperty("--i", i);
      s.style.color = CONFIG.colors[i % CONFIG.colors.length];
      line.appendChild(s);
    });
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = CONFIG.name;
    title.append(line, name);
  
    $("ageLine").textContent = CONFIG.age ? "Cheers to " + CONFIG.age + " wonderful years!" : "";
  
    // Photo, with a fallback circle showing the first letter of the name
    const photoWrap = $("photoWrap");
    const img = $("photo");
    $("photoFallback").textContent = (CONFIG.name || "?").trim().charAt(0).toUpperCase();
    if (CONFIG.photo) {
      img.onerror = () => photoWrap.classList.add("no-photo");
      img.src = CONFIG.photo;
    } else {
      photoWrap.classList.add("no-photo");
    }
  
    // Music
    if (CONFIG.music) song.src = CONFIG.music;
  
    buildCandles();
  }
  
  function buildCandles() {
    candlesBox.innerHTML = "";
    const count = Math.max(1, Math.min(10, Number(CONFIG.candles) || 5));
    for (let i = 0; i < count; i++) {
      const candle = document.createElement("span");
      candle.className = "candle";
      candle.style.setProperty("--c", CONFIG.colors[i % CONFIG.colors.length]);
      const flame = document.createElement("span");
      flame.className = "flame";
      candle.appendChild(flame);
      candlesBox.appendChild(candle);
    }
  }
  
  /* ---------- Twinkling stars ---------- */
  function makeStars(count = 110) {
    const box = $("stars");
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = rand(1, 3);
      s.style.width = s.style.height = size + "px";
      s.style.left = rand(0, 100) + "%";
      s.style.top = rand(0, 100) + "%";
      s.style.setProperty("--d", rand(1.5, 4) + "s");
      s.style.setProperty("--delay", rand(0, 4) + "s");
      box.appendChild(s);
    }
  }
  
  /* ---------- Floating balloons ---------- */
  function makeBalloons(count = 14) {
    const box = $("balloons");
    box.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const b = document.createElement("span");
      b.className = "balloon";
      const w = rand(46, 72);
      b.style.width = w + "px";
      b.style.height = w * 1.22 + "px";
      b.style.left = rand(0, 95) + "%";
      b.style.setProperty("--c", pick(CONFIG.colors));
      b.style.setProperty("--dur", rand(9, 16) + "s");
      b.style.setProperty("--delay", rand(0, 8) + "s");
      box.appendChild(b);
    }
  }
  
  /* ---------- Confetti (drawn on a canvas, no library needed) ---------- */
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  let pieces = [];
  let animating = false;
  let rainUntil = 0;
  
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  
  function newPiece(x, y, vx, vy) {
    return {
      x, y, vx, vy,
      size: rand(6, 11),
      color: pick(CONFIG.colors),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.2, 0.2),
      round: Math.random() < 0.3
    };
  }
  
  function burst(x, y, count = 160) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(3, 11);
      pieces.push(newPiece(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 5));
    }
    startConfetti();
  }
  
  function rain(ms = 3500) {
    rainUntil = performance.now() + ms;
    startConfetti();
  }
  
  function startConfetti() {
    if (!animating) {
      animating = true;
      requestAnimationFrame(drawConfetti);
    }
  }
  
  function drawConfetti(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  
    if (now < rainUntil) {
      for (let i = 0; i < 4; i++) {
        pieces.push(newPiece(rand(0, innerWidth), -10, rand(-1, 1), rand(2, 4)));
      }
    }
  
    for (const p of pieces) {
      p.vy += 0.16;          // gravity
      p.vx *= 0.99;          // air
      p.vy *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
  
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.rot * 2));   // flutter
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
  
    pieces = pieces.filter((p) => p.y < innerHeight + 30);
  
    if (pieces.length || now < rainUntil) {
      requestAnimationFrame(drawConfetti);
    } else {
      animating = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }
  
  /* ---------- Music ---------- */
  function startMusic() {
    if (!CONFIG.music) return;
    song.volume = 0.7;
    try { song.currentTime = CONFIG.musicStartAt || 0; } catch (e) { /* not loaded yet */ }
    song.play()
      .then(() => musicBtn.classList.add("show", "playing"))
      .catch(() => musicBtn.classList.remove("show"));   // file missing or blocked
  }
  
  musicBtn.addEventListener("click", () => {
    if (song.paused) {
      song.play();
      musicBtn.classList.add("playing");
    } else {
      song.pause();
      musicBtn.classList.remove("playing");
    }
  });
  
  /* ---------- Typing message ---------- */
  function typeMessage(text, done) {
    clearTimeout(typingTimer);
    messageEl.textContent = "";
    messageEl.classList.add("typing");
    let i = 0;
    (function step() {
      if (i < text.length) {
        const ch = text[i++];
        messageEl.textContent += ch;
        typingTimer = setTimeout(step, ch === "\n" ? CONFIG.typingSpeed * 8 : CONFIG.typingSpeed);
      } else {
        messageEl.classList.remove("typing");
        if (done) done();
      }
    })();
  }
  
  /* ---------- Screen 1: open the gift ---------- */
  giftBtn.addEventListener("click", () => {
    if (giftBtn.classList.contains("open")) return;
    giftBtn.classList.add("open");
    startMusic();                       // a click is needed before browsers allow sound
  
    const r = giftBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 3, 120);
  
    setTimeout(() => {
      intro.classList.remove("active");
      party.classList.add("active");
      makeBalloons();
      window.scrollTo(0, 0);
    }, 1100);
  });
  
  /* ---------- Screen 2: blow out the candles ---------- */
  cake.addEventListener("click", () => {
    if (candlesOut) return;
    candlesOut = true;
    cake.classList.add("done");
  
    const candles = [...candlesBox.children];
    candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 140));
  
    setTimeout(() => {
      const r = cake.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 3, 200);
      rain(3500);
      $("title").classList.add("celebrate");
      cakeHint.textContent = "Yay! Your wish is on its way";
  
      card.classList.add("show");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      signature.classList.remove("show");
      signature.textContent = CONFIG.from;
      typeMessage(CONFIG.message, () => {
        signature.classList.add("show");
        replayBtn.classList.add("show");
      });
    }, candles.length * 140 + 300);
  });
  
  /* ---------- Replay ---------- */
  replayBtn.addEventListener("click", () => {
    clearTimeout(typingTimer);
    candlesOut = false;
    cake.classList.remove("done");
    buildCandles();
    card.classList.remove("show");
    replayBtn.classList.remove("show");
    $("title").classList.remove("celebrate");
    cakeHint.textContent = "Make another wish, then tap the cake";
    burst(innerWidth / 2, innerHeight / 3, 120);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
  /* ---------- Start ---------- */
  applyConfig();
  makeStars();
  