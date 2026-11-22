/* THE ORIEL · Howard & Conway
   Chapter 1: scroll-scrubbed tower climb with a live floor readout.
   Chapters 2 and 3: model hubs that dolly into photoreal room renders.
   Conversion: one private tour enquiry sheet, opened from every CTA. */

const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const smooth = t => t * t * (3 - 2 * t);

/* ---------------------------------------------------------------- data */

/* Floor readout stops. Floor 27 and the rooftop lines are read from the
   source video. The spec lines for floors 5 and 23 were not legible at the
   source resolution, so those two rows are our copy, written in the same
   format and voice as floor 27. */
const FLOORS = [
  { key: "5",  label: "THE RESIDENCE", spec1: "2 Bed · 2 Bath · 1,480 SF",    spec2: "From $1.2M", enter: "VIEW DETAILS" },
  { key: "23", label: "THE RESIDENCE", spec1: "3 Bed · 2.5 Bath · 2,150 SF",  spec2: "From $2.6M", enter: "VIEW DETAILS" },
  { key: "27", label: "THE PENTHOUSE", spec1: "3 Bed + Study · 3.5 Bath · 4,400 SF", spec2: "From $7.9M", enter: "ENTER THE PENTHOUSE" },
  { key: "R",  label: "THE ROOFTOP",   spec1: "Restaurant · Bar · Terrace",   spec2: "Open-Air Dining", enter: "EXPLORE THE ROOFTOP" }
];

const FLOOR_DETAILS = {
  "5": {
    eyebrow: "FLOOR 5 · THE RESIDENCE", title: "THE RESIDENCE", price: "From $1.2M",
    interest: "A Residence",
    grid: [["BEDROOMS", "2"], ["BATHROOMS", "2"], ["INTERIOR", "1,480 SF"], ["TERRACE", "210 SF"], ["CEILING", "10 FT"], ["ASPECT", "South, over the ballpark"]],
    list: [
      "Open great room to a full-width terrace, five floors above the street",
      "Chef's kitchen in walnut and black marble, to the penthouse standard",
      "Primary suite with a marble bath and a dressing wall",
      "Residents' floors include the rooftop restaurant, bar and terrace"
    ]
  },
  "23": {
    eyebrow: "FLOOR 23 · THE RESIDENCE", title: "THE RESIDENCE", price: "From $2.6M",
    interest: "A Residence",
    grid: [["BEDROOMS", "3"], ["BATHROOMS", "2.5"], ["INTERIOR", "2,150 SF"], ["TERRACE", "340 SF"], ["CEILING", "10 FT"], ["ASPECT", "Corner, ballpark and skyline"]],
    list: [
      "Corner glass on two sides, the ballpark below and the skyline beyond",
      "Three bedrooms split either side of the great room for privacy",
      "Chef's kitchen in walnut and black marble, to the penthouse standard",
      "Residents' floors include the rooftop restaurant, bar and terrace"
    ]
  },
  "27": {
    eyebrow: "FLOOR 27 · AVAILABLE", title: "THE PENTHOUSE", price: "From $7.9M",
    interest: "The Penthouse",
    grid: [["BEDROOMS", "3 + Study"], ["BATHROOMS", "3.5"], ["INTERIOR", "4,400 SF"], ["TERRACE", "Wraparound, two sides"], ["CEILING", "12 FT"], ["ASPECT", "Full floor, every direction"]],
    list: [
      "The whole 27th floor: one residence, no neighbours on the level",
      "Great room with corner glass straight over the ballpark",
      "Chef's kitchen with a backlit glass wine wall and black marble island",
      "Primary suite and spa bath in book-matched marble",
      "Wraparound terrace with planters, an outdoor dining table and a fire bowl"
    ]
  },
  "R": {
    eyebrow: "TOP OF THE TOWER", title: "THE ROOFTOP", price: "Restaurant · Bar · Terrace",
    interest: "The Rooftop",
    grid: [["LEVELS", "Two, one open-air"], ["RESTAURANT", "64 covers"], ["THE BAR", "Black marble, bottle wall"], ["TERRACE", "Pergola and fire tables"], ["HOURS", "Daily from 5 PM"], ["ACCESS", "Residents and guests"]],
    list: [
      "A restaurant under crystal chandeliers, glass on the ballpark side",
      "The bar: black marble counter, seven stools, a backlit bottle wall",
      "The terrace above: pergola, festoon lights, fire tables, skyline on both sides",
      "A private stair links the bar to the terrace, residents only"
    ]
  }
};

const HUBS = {
  penthouse: {
    subline: "Floor 27 · The Penthouse",
    order: ["great", "kitchen", "suite", "spa"],
    rooms: {
      great: {
        name: "GREAT ROOM", img: "img/room-great.jpg",
        hotspots: [
          { x: 66, y: 34, label: "Corner glass, two sides", desc: "Floor-to-ceiling glass on two sides, straight over the ballpark. The room turns its back on the tower and faces the game." },
          { x: 40, y: 64, label: "Black marble coffee table", desc: "Book-matched black marble, cut for this room, between the grey sectional and the two tan leather armchairs." },
          { x: 85, y: 58, label: "Terrace and fire bowl", desc: "Sliding glass opens the great room to the wraparound terrace, its planters and its fire bowl." }
        ]
      },
      kitchen: {
        name: "CHEF'S KITCHEN", img: "img/room-kitchen.jpg",
        hotspots: [
          { x: 13, y: 42, label: "Glass wine wall", desc: "A full-height, backlit glass wine wall, temperature controlled, holding the collection at serving temperature." },
          { x: 48, y: 58, label: "Black marble island", desc: "One slab of black marble, five burnt orange stools, seating for the cook's audience." },
          { x: 87, y: 44, label: "Double wall ovens", desc: "Built-in black double wall ovens beside the black marble range, so two courses never wait on one another." }
        ]
      },
      suite: {
        name: "PRIMARY SUITE", img: "img/room-suite.jpg",
        hotspots: [
          { x: 34, y: 40, label: "Walnut headboard wall", desc: "A full-width walnut headboard wall with the reading lights built in, warm against the glass." },
          { x: 68, y: 30, label: "Ballpark view from the bed", desc: "The bed faces the glass: the ballpark below, the skyline beyond, blackout blinds behind the linen drapes." },
          { x: 82, y: 62, label: "Tan leather reading chairs", desc: "Two reading chairs in tan leather by the window, the same leather as the great room armchairs." }
        ]
      },
      spa: {
        name: "SPA BATH", img: "img/room-spa.jpg",
        hotspots: [
          { x: 46, y: 55, label: "Freestanding stone tub", desc: "A single carved stone tub set in front of the glass, filled from a floor-standing brass tap." },
          { x: 18, y: 30, label: "Book-matched marble", desc: "Walls in book-matched marble, the vein running unbroken from panel to panel." },
          { x: 84, y: 38, label: "Glass rain shower", desc: "A glass rain shower with a marble bench, steam ready, behind the vanity wall." }
        ]
      }
    }
  },
  rooftop: {
    subline: "Top of the tower · The Rooftop",
    order: ["restaurant", "bar", "terrace"],
    rooms: {
      restaurant: {
        name: "THE RESTAURANT", img: "img/room-restaurant.jpg",
        hotspots: [
          { x: 50, y: 22, label: "Crystal chandeliers", desc: "Crystal chandeliers over every table, dimmed to candle level once the game lights come on." },
          { x: 16, y: 44, label: "Ballpark below", desc: "Floor-to-ceiling glass on the ballpark side. Dinner first, the ninth inning after." },
          { x: 86, y: 48, label: "Open kitchen", desc: "The kitchen works in the open at the far end of the room, counter seats for six." }
        ]
      },
      bar: {
        name: "THE BAR", img: "img/room-bar.jpg",
        hotspots: [
          { x: 52, y: 34, label: "Backlit bottle wall", desc: "The full back wall is shelving and light: every bottle backlit, the room's only artwork." },
          { x: 12, y: 52, label: "Stair up to the terrace", desc: "The stair at the end of the bar climbs to the terrace, residents and their guests only." },
          { x: 62, y: 62, label: "Black marble counter", desc: "Seven burnt orange stools at a black marble counter, cut from the same stone as the penthouse island." }
        ]
      },
      terrace: {
        name: "THE TERRACE", img: "img/room-terrace.jpg",
        hotspots: [
          { x: 50, y: 16, label: "Festoon lights", desc: "Festoon lights strung under the black pergola, the terrace lit by them and the fire tables alone." },
          { x: 22, y: 58, label: "Fire tables", desc: "Fire tables burn on both sides of the deck, lit from dusk until close." },
          { x: 76, y: 50, label: "Outdoor bar, six stools", desc: "A second, smaller bar outside against the bronze panel wall, six stools, skyline on both sides." }
        ]
      }
    }
  }
};

/* ------------------------------------------------------- chapter 1 */

const tower = $("#tower");
const intro = $("#towerIntro");
const readout = $("#readout");
const roNumeral = $("#roNumeral");
const roLabel = $("#roLabel");
const roSpec1 = $("#roSpec1");
const roSpec2 = $("#roSpec2");
const roEnter = $("#roEnter");
const backToStreet = $("#backToStreet");
const frames = $$(".frame").map(el => ({
  el,
  inA: parseFloat(el.dataset.inA || "0"), inB: parseFloat(el.dataset.inB || "0"),
  outA: parseFloat(el.dataset.outA || "2"), outB: parseFloat(el.dataset.outB || "2"),
  sFrom: parseFloat(el.dataset.sFrom || "1"), sTo: parseFloat(el.dataset.sTo || "1.12")
}));

/* Frame choreography: crossfade windows and scale travel per exterior. */
const FRAME_DEFS = {
  street: { inA: -1, inB: -1, outA: 0.17, outB: 0.31, sFrom: 1.0, sTo: 1.13, span: [0, 0.31] },
  aerial: { inA: 0.17, inB: 0.31, outA: 0.44, outB: 0.58, sFrom: 1.1, sTo: 1.0, span: [0.17, 0.58] },
  facade: { inA: 0.44, inB: 0.58, outA: 0.70, outB: 0.84, sFrom: 1.0, sTo: 1.15, span: [0.44, 0.84] },
  crown:  { inA: 0.70, inB: 0.84, outA: 2, outB: 2, sFrom: 1.02, sTo: 1.14, span: [0.70, 1] }
};
frames.forEach(f => Object.assign(f, FRAME_DEFS[f.el.dataset.frame]));

/* Scroll-scrubbed floor counter keyframes: [progress, floor]. */
const FLOOR_KEYS = [[0, 1], [0.15, 5], [0.30, 5], [0.42, 13], [0.52, 21], [0.58, 23], [0.66, 25.5], [0.73, 27], [1, 27]];
function floorAt(p) {
  for (let i = 1; i < FLOOR_KEYS.length; i++) {
    if (p <= FLOOR_KEYS[i][0]) {
      const [p0, f0] = FLOOR_KEYS[i - 1], [p1, f1] = FLOOR_KEYS[i];
      return f0 + (f1 - f0) * ((p - p0) / (p1 - p0));
    }
  }
  return 27;
}
function stopIndexAt(p) {
  if (p < 0.335) return 0;
  if (p < 0.585) return 1;
  if (p < 0.85) return 2;
  return 3;
}

let currentStop = -1;
function setStop(idx) {
  if (idx === currentStop) return;
  currentStop = idx;
  const f = FLOORS[idx];
  roLabel.textContent = f.label;
  roSpec1.textContent = f.spec1;
  roSpec2.textContent = f.spec2;
  roEnter.textContent = f.enter;
  readout.classList.remove("swap");
  void readout.offsetWidth;
  readout.classList.add("swap");
}

function climbProgress() {
  const rect = tower.getBoundingClientRect();
  const total = tower.offsetHeight - window.innerHeight;
  return clamp(-rect.top / total, 0, 1);
}

function updateClimb() {
  const p = climbProgress();
  frames.forEach(f => {
    let o = 1;
    if (f.inA >= 0) o = Math.min(o, smooth(seg(p, f.inA, f.inB)));
    if (f.outA <= 1) o = Math.min(o, 1 - smooth(seg(p, f.outA, f.outB)));
    const s = f.sFrom + (f.sTo - f.sFrom) * seg(p, f.span[0], f.span[1]);
    f.el.style.opacity = o.toFixed(3);
    f.el.style.transform = REDUCED ? "none" : `scale(${s.toFixed(4)})`;
  });
  intro.style.opacity = (1 - seg(p, 0.02, 0.10)).toFixed(3);
  intro.style.pointerEvents = p > 0.05 ? "none" : "auto";

  const on = p >= 0.13;
  readout.classList.toggle("on", on);
  backToStreet.classList.toggle("on", p > 0.05);
  if (on) {
    const stop = stopIndexAt(p);
    setStop(stop);
    roNumeral.textContent = stop === 3 ? "R" : String(Math.round(floorAt(p)));
    const f = floorAt(p);
    /* Keep the readout clear of the fixed header at the top of the climb. */
    const y = stop === 3 ? 21 : clamp(76 - ((f - 1) / 26) * 56, 22, 80);
    readout.style.top = y.toFixed(2) + "%";
  }
}

let ticking = false;
function onScroll() {
  $("#siteHeader").classList.toggle("scrolled", window.scrollY > 40);
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => { updateClimb(); ticking = false; });
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
updateClimb();
onScroll();

function scrollToY(y) {
  /* Short hops glide; long jumps (nav across the whole climb) land at once,
     so a tap never leaves the visitor waiting on a multi-second scroll. */
  const far = Math.abs(y - window.scrollY) > 2600;
  window.scrollTo({ top: y, behavior: REDUCED || far ? "auto" : "smooth" });
}
function scrollToProgress(p) {
  scrollToY(tower.offsetTop + p * (tower.offsetHeight - window.innerHeight));
}
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) scrollToY(el.offsetTop);
}

backToStreet.addEventListener("click", () => scrollToY(tower.offsetTop));
roEnter.addEventListener("click", () => {
  const key = FLOORS[currentStop < 0 ? 0 : currentStop].key;
  if (key === "27") scrollToSection("penthouse");
  else if (key === "R") scrollToSection("rooftop");
  else openDetail(key);
});
roLabel.addEventListener("click", () => openDetail(FLOORS[currentStop < 0 ? 0 : currentStop].key));
roSpec2.addEventListener("click", () => openDetail(FLOORS[currentStop < 0 ? 0 : currentStop].key));

/* header nav */
const NAV = {
  residences: () => scrollToProgress(0.22),
  penthouse: () => scrollToSection("penthouse"),
  rooftop: () => scrollToSection("rooftop")
};
$$("[data-nav]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  NAV[el.dataset.nav] && NAV[el.dataset.nav]();
}));

/* ------------------------------------------------------- hubs and rooms */

const hubIO = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("inview"); });
}, { threshold: 0.25 });
$$(".hub").forEach(h => hubIO.observe(h));

$$(".hub").forEach(hubEl => {
  const hubName = hubEl.dataset.hub;
  const data = HUBS[hubName];
  const roomView = $(".room-view", hubEl);
  const modelBtn = $("[data-open-first]", hubEl);
  let activeRoom = null;
  let activeHotspot = null;

  $$(".tab", hubEl).forEach(tab => {
    tab.addEventListener("click", () => openRoom(tab.dataset.room));
  });
  modelBtn.addEventListener("click", () => openRoom(data.order[0]));
  $$(".back-to-tower", hubEl).forEach(btn => {
    btn.addEventListener("click", () => scrollToProgress(btn.dataset.backFloor === "R" ? 0.92 : 0.70));
  });

  function markTabs() {
    $$(".tab", hubEl).forEach(t => t.classList.toggle("active", t.dataset.room === activeRoom));
  }

  function buildRoom(roomId) {
    const room = data.rooms[roomId];
    const thumbs = data.order.map(id => {
      const r = data.rooms[id];
      const short = r.name.replace(/^THE /, "");
      return `<button type="button" class="thumb${id === roomId ? " active" : ""}" data-room="${id}" aria-label="Open ${r.name}">
        <img src="${r.img}" alt=""><span>${short}</span></button>`;
    }).join("");
    const spots = room.hotspots.map((h, i) => `
      <div class="hotspot${h.x >= 62 ? " flip" : ""}" style="left:${h.x}%; top:${h.y}%">
        <button type="button" class="hs-dot" data-hs="${i}" aria-label="${h.label}"></button>
        <span class="hs-line" aria-hidden="true"></span>
        <button type="button" class="hs-label" data-hs="${i}">${h.label}</button>
      </div>`).join("");
    roomView.innerHTML = `
      <div class="room-media"><img src="${room.img}" alt="${room.name}, floor render"></div>
      <div class="room-shade"></div>
      ${spots}
      <div class="hs-card" hidden><h4></h4><p></p></div>
      <div class="room-head room-ui"><h3>${room.name}</h3><p>${data.subline}</p></div>
      <div class="filmstrip room-ui">${thumbs}</div>
      <button type="button" class="pill-dark room-back room-ui">&#8592;&nbsp; BACK TO FLOOR PLAN</button>`;

    $$(".thumb", roomView).forEach(t => t.addEventListener("click", () => switchRoom(t.dataset.room)));
    $(".room-back", roomView).addEventListener("click", closeRoom);
    $$("[data-hs]", roomView).forEach(btn => btn.addEventListener("click", () => toggleHotspot(room, parseInt(btn.dataset.hs, 10), btn)));
  }

  function toggleHotspot(room, idx, btn) {
    const card = $(".hs-card", roomView);
    const spot = btn.closest(".hotspot");
    if (activeHotspot === idx) {
      activeHotspot = null;
      card.hidden = true;
      spot.classList.remove("active");
      return;
    }
    activeHotspot = idx;
    $$(".hotspot", roomView).forEach(s => s.classList.remove("active"));
    spot.classList.add("active");
    $("h4", card).textContent = room.hotspots[idx].label;
    $("p", card).textContent = room.hotspots[idx].desc;
    card.hidden = false;
  }

  function openRoom(roomId) {
    if (activeRoom === roomId) return;
    activeRoom = roomId;
    activeHotspot = null;
    markTabs();
    buildRoom(roomId);
    const model = $(".hub-model img", hubEl);
    if (REDUCED) {
      hubEl.classList.add("room-open");
      roomView.hidden = false;
      requestAnimationFrame(() => roomView.classList.add("landed"));
      return;
    }
    model.style.transition = "transform 0.8s ease, filter 0.8s ease, opacity 0.8s ease";
    model.style.transform = "scale(1.5)";
    model.style.filter = "blur(10px)";
    model.style.opacity = "0.3";
    setTimeout(() => {
      hubEl.classList.add("room-open");
      roomView.hidden = false;
      setTimeout(() => roomView.classList.add("landed"), 380);
    }, 800);
  }

  function switchRoom(roomId) {
    if (roomId === activeRoom) return;
    activeRoom = roomId;
    activeHotspot = null;
    markTabs();
    roomView.classList.remove("landed");
    setTimeout(() => {
      buildRoom(roomId);
      requestAnimationFrame(() => roomView.classList.add("landed"));
    }, REDUCED ? 0 : 260);
  }

  function closeRoom() {
    activeRoom = null;
    activeHotspot = null;
    markTabs();
    roomView.classList.remove("landed");
    setTimeout(() => {
      roomView.hidden = true;
      roomView.innerHTML = "";
      hubEl.classList.remove("room-open");
      const model = $(".hub-model img", hubEl);
      model.style.transform = "";
      model.style.filter = "";
      model.style.opacity = "";
    }, REDUCED ? 0 : 300);
  }
});

/* ------------------------------------------------------- sheets */

const detailSheet = $("#detailSheet"), detailBackdrop = $("#detailBackdrop");
const tourSheet = $("#tourSheet"), tourBackdrop = $("#tourBackdrop");
let detailKey = "27";

function showSheet(sheet, backdrop) {
  sheet.hidden = false;
  backdrop.hidden = false;
  void sheet.offsetWidth; /* commit the hidden state before transitioning in */
  sheet.classList.add("on");
  backdrop.classList.add("on");
  document.body.style.overflow = "hidden";
}
function hideSheet(sheet, backdrop) {
  sheet.classList.remove("on");
  backdrop.classList.remove("on");
  setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; }, REDUCED ? 0 : 420);
  document.body.style.overflow = "";
}
function closeAllSheets() {
  if (!detailSheet.hidden) hideSheet(detailSheet, detailBackdrop);
  if (!tourSheet.hidden) hideSheet(tourSheet, tourBackdrop);
}

function openDetail(key) {
  detailKey = key;
  const d = FLOOR_DETAILS[key];
  $("#detailEyebrow").textContent = d.eyebrow;
  $("#detailTitle").textContent = d.title;
  $("#detailPrice").textContent = d.price;
  $("#detailGrid").innerHTML = d.grid.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("#detailList").innerHTML = d.list.map(item => `<li>${item}</li>`).join("");
  showSheet(detailSheet, detailBackdrop);
}

function openTour(interest) {
  if (interest) {
    const sel = $("#tourInterest");
    if (Array.from(sel.options).some(o => o.text === interest || o.value === interest)) sel.value = interest;
  }
  showSheet(tourSheet, tourBackdrop);
}

$$(".tour-open").forEach(btn => btn.addEventListener("click", () => openTour(btn.dataset.interest)));
$("#detailTour").addEventListener("click", () => {
  hideSheet(detailSheet, detailBackdrop);
  setTimeout(() => openTour(FLOOR_DETAILS[detailKey].interest), REDUCED ? 0 : 200);
});
$("#penthouseSub").addEventListener("click", () => openDetail("27"));
$("#rooftopSub").addEventListener("click", () => openDetail("R"));
$$("[data-close-sheet]").forEach(btn => btn.addEventListener("click", closeAllSheets));
[detailBackdrop, tourBackdrop].forEach(b => b.addEventListener("click", closeAllSheets));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllSheets(); });

/* tour form */
$("#tourForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.elements.namedItem("name");
  const emailInput = form.elements.namedItem("email");
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const err = $("#tourError");
  if (name.length < 2) {
    err.textContent = "Please add your name, so we know who the tour is for.";
    err.hidden = false;
    nameInput.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = "Please add a valid email address, so we can confirm your time.";
    err.hidden = false;
    emailInput.focus();
    return;
  }
  err.hidden = true;
  const interest = $("#tourInterest").value;
  $("#tourSuccessText").textContent =
    `Thank you, ${name.split(" ")[0]}. Your request for ${interest} is with the Howard & Conway team, who will reply to ${email} within one business day to fix your time.`;
  form.hidden = true;
  $("#tourSuccess").hidden = false;
});
