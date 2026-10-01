/**
 * Sony WH-CH520 Interactive Cinematic Experience
 * 24 FPS Scroll-Controlled & Film Playback Engine
 * Frame Sequence Only
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 264;
  const FRAME_DIRECTORY = 'assets/ezgif-299ea441f97edf5f-jpg';
  const FRAME_BASE_NAME = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';
  const BASE_FPS = 24;

  // --- State ---
  const state = {
    frames: [],
    loadedCount: 0,
    currentFrame: 0,
    targetFrame: 0,
    isPlaying: false,
    playSpeed: 1,
    lastPlayTime: 0,
    userInteractingWithHUD: false,
    hasDrawnFirst: false
  };

  // --- DOM Elements ---
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas.getContext('2d');
  const scrollySection = document.getElementById('scrolly-section');
  const filmToggleBtn = document.getElementById('film-toggle-btn');
  const glowOrb = document.getElementById('glow-orb');
  const centerTitleContainer = document.querySelector('.center-title-container');
  const editorialLeft = document.getElementById('editorial-left');
  const editorialRight = document.getElementById('editorial-right');
  const scrimLeft = document.getElementById('scrim-left');
  const scrimRight = document.getElementById('scrim-right');

  // --- Helper: Format frame filename ---
  function getFrameUrl(index) {
    const pad = String(index + 1).padStart(3, '0');
    return `${FRAME_DIRECTORY}/${FRAME_BASE_NAME}${pad}${FRAME_EXT}`;
  }

  // --- Frame Preloader with Guaranteed 3-Second Cinematic Stage ---
  const MIN_LOADING_TIME = 1000; // 3 seconds minimum loading time
  const loadingStartTime = performance.now();
  let displayedPct = 0;
  let allFramesLoaded = false;
  let preloaderFinished = false;

  function updateLoadingProgress() {
    if (preloaderFinished) return;
    const now = performance.now();
    const elapsed = now - loadingStartTime;
    const timeProgress = Math.min(elapsed / MIN_LOADING_TIME, 1);

    // If frames are already cached/loaded, smoothly pace progress up to 100% over 3s
    const actualProgress = TOTAL_FRAMES > 0 ? (state.loadedCount / TOTAL_FRAMES) : 0;
    const targetRatio = allFramesLoaded ? timeProgress : Math.min(timeProgress, actualProgress);
    const targetPct = Math.floor(targetRatio * 100);

    if (targetPct > displayedPct) {
      displayedPct = targetPct;
      if (loaderBar) loaderBar.style.width = `${displayedPct}%`;
      if (loaderPercent) loaderPercent.textContent = `${displayedPct}%`;
    }

    // Both conditions: all frames loaded AND full 3 seconds elapsed
    if (allFramesLoaded && elapsed >= MIN_LOADING_TIME) {
      preloaderFinished = true;
      if (loaderBar) loaderBar.style.width = '100%';
      if (loaderPercent) loaderPercent.textContent = '100%';
      setTimeout(finishLoading, 250);
      return;
    }

    requestAnimationFrame(updateLoadingProgress);
  }

  function preloadFrames() {
    let loaded = 0;
    requestAnimationFrame(updateLoadingProgress);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);

      const onFrameDone = () => {
        loaded++;
        state.loadedCount = loaded;

        // Render first frame immediately behind preloader
        if (i === 0 && !state.hasDrawnFirst) {
          state.hasDrawnFirst = true;
          resizeCanvas();
          renderFrame(0);
          updateNarrativeUI(0);
        }

        if (loaded === TOTAL_FRAMES) {
          allFramesLoaded = true;
        }
      };

      img.onload = onFrameDone;
      img.onerror = onFrameDone;

      state.frames.push(img);
    }
  }

  function finishLoading() {
    if (preloader) {
      preloader.classList.add('fade-out');
    }
    resizeCanvas();
    renderFrame(state.currentFrame);
    updateNarrativeUI(state.currentFrame);
  }

  // --- Canvas Rendering with High-DPI Support & Full Screen Scaling ---
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);

    renderFrame(Math.round(state.currentFrame));
    updateNarrativeUI(state.currentFrame);
  }

  window.addEventListener('resize', resizeCanvas);

  function renderFrame(frameIdx) {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)));
    const img = state.frames[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Fullscreen Cover: 100% full bleed, zero blank sides, zero empty bars
    const scale = Math.max(w / imgW, h / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (w - drawW) / 2;

    // Smart vertical framing:
    // When drawH > h, anchor early frames downward so the headband is never cut off
    const naturalCenterY = (h - drawH) / 2;
    const progress = idx / (TOTAL_FRAMES - 1);
    const topBias = Math.max(0, 1 - progress * 2.5); // 1.0 at start, smoothly transitions to 0 by 40%
    const drawY = Math.min(0, naturalCenterY + (Math.abs(naturalCenterY) * 0.78 * topBias));

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // --- Scroll Scrubbing Engine with Lerp ---
  function updateScrollProgress() {
    if (state.isPlaying || state.userInteractingWithHUD) return;

    const rect = scrollySection.getBoundingClientRect();
    const scrollTravel = rect.height - window.innerHeight;

    if (scrollTravel <= 0) return;

    // Progress 0 to 1
    const progress = Math.max(0, Math.min(1, -rect.top / scrollTravel));
    state.targetFrame = progress * (TOTAL_FRAMES - 1);
  }

  // --- Navbar Scroll Visibility (hides when scrolled into product details so it doesn't cover content) ---
  const navbarElement = document.getElementById('navbar');
  function handleNavbarVisibility() {
    if (!scrollySection || !navbarElement) return;
    const rect = scrollySection.getBoundingClientRect();
    if (rect.bottom <= 120) {
      navbarElement.classList.add('nav-hidden');
    } else {
      navbarElement.classList.remove('nav-hidden');
    }
  }

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleNavbarVisibility();
  }, { passive: true });

  // Main Animation Loop
  function animationLoop(timestamp) {
    if (state.isPlaying) {
      // 24 FPS Film playback
      const frameDuration = 1000 / (BASE_FPS * state.playSpeed);
      if (!state.lastPlayTime) state.lastPlayTime = timestamp;

      const elapsed = timestamp - state.lastPlayTime;
      if (elapsed >= frameDuration) {
        state.lastPlayTime = timestamp;
        state.targetFrame += 1;

        if (state.targetFrame >= TOTAL_FRAMES) {
          state.targetFrame = 0; // Loop seamlessly
        }

        syncScrollWithFrame(state.targetFrame);
      }
    }

    // Smooth Lerp damping
    const lerpFactor = state.isPlaying ? 0.3 : 0.16;
    const delta = state.targetFrame - state.currentFrame;

    if (Math.abs(delta) > 0.01) {
      state.currentFrame += delta * lerpFactor;
      renderFrame(Math.round(state.currentFrame));
      updateNarrativeUI(state.currentFrame);
    }

    requestAnimationFrame(animationLoop);
  }

  // --- Scroll-Driven Narrative UI (Hero Title -> Left Card -> Right Card) ---
  function updateNarrativeUI(frame) {
    const isMobile = window.innerWidth <= 900;

    // 1. Center Hero Title: Full opacity at Frame 0 (starts at 1.0, stays solid till frame 18, fades by frame 38)
    if (centerTitleContainer) {
      let titleOpacity = 0;
      if (frame <= 18) {
        titleOpacity = 1;
      } else if (frame <= 38) {
        titleOpacity = 1 - (frame - 18) / (38 - 18);
      } else {
        titleOpacity = 0;
      }
      centerTitleContainer.style.opacity = titleOpacity.toFixed(3);
      centerTitleContainer.style.transform = `translate(-50%, calc(-50% - ${(1 - titleOpacity) * 28}px))`;
    }

    // 2. Left Side Editorial & Scrim (DSEE Sound & 30mm Drivers: Frames 45 - 138)
    let leftOpacity = 0;
    if (frame < 45) {
      leftOpacity = 0;
    } else if (frame <= 68) {
      leftOpacity = (frame - 45) / (68 - 45);
    } else if (frame <= 118) {
      leftOpacity = 1;
    } else if (frame <= 138) {
      leftOpacity = 1 - (frame - 118) / (138 - 118);
    } else {
      leftOpacity = 0;
    }

    if (scrimLeft) {
      scrimLeft.style.opacity = (leftOpacity * 0.95).toFixed(3);
    }

    if (editorialLeft) {
      editorialLeft.style.opacity = leftOpacity.toFixed(3);
      editorialLeft.style.pointerEvents = leftOpacity > 0.6 ? 'auto' : 'none';

      if (isMobile) {
        const yShift = (1 - leftOpacity) * 18;
        editorialLeft.style.transform = `translateX(-50%) translateY(${yShift.toFixed(1)}px)`;
      } else {
        const xShift = -25 * (1 - leftOpacity);
        editorialLeft.style.transform = `translateY(-50%) translateX(${xShift.toFixed(1)}px)`;
      }
    }

    // 3. Right Side Editorial & Scrim (Power, 50-Hr Battery, Multipoint: Frames 145 through final frame)
    let rightOpacity = 0;
    if (frame < 145) {
      rightOpacity = 0;
    } else if (frame <= 168) {
      rightOpacity = (frame - 145) / (168 - 145);
    } else {
      rightOpacity = 1; // Stays fully visible until final frame
    }

    if (scrimRight) {
      scrimRight.style.opacity = (rightOpacity * 0.95).toFixed(3);
    }

    if (editorialRight) {
      editorialRight.style.opacity = rightOpacity.toFixed(3);
      editorialRight.style.pointerEvents = rightOpacity > 0.6 ? 'auto' : 'none';

      if (isMobile) {
        const yShift = (1 - rightOpacity) * 18;
        editorialRight.style.transform = `translateX(-50%) translateY(${yShift.toFixed(1)}px)`;
      } else {
        const xShift = 25 * (1 - rightOpacity);
        editorialRight.style.transform = `translateY(-50%) translateX(${xShift.toFixed(1)}px)`;
      }
    }
  }

  requestAnimationFrame(animationLoop);

  // Sync scroll position when film is playing
  function syncScrollWithFrame(frameIdx) {
    const rect = scrollySection.getBoundingClientRect();
    const scrollTravel = rect.height - window.innerHeight;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const sectionTop = currentScrollY + rect.top;
    const targetScrollY = sectionTop + (frameIdx / (TOTAL_FRAMES - 1)) * scrollTravel;

    if (Math.abs(currentScrollY - targetScrollY) > 5) {
      window.scrollTo({
        top: targetScrollY,
        behavior: 'instant'
      });
    }
  }

  // --- Film Mode Controls ---
  function toggleFilmPlay() {
    state.isPlaying = !state.isPlaying;
    state.lastPlayTime = 0;

    if (filmToggleBtn) {
      if (state.isPlaying) {
        filmToggleBtn.querySelector('.btn-icon').textContent = '❚❚';
        filmToggleBtn.querySelector('.btn-text').textContent = 'Pause Film';
        filmToggleBtn.classList.add('active');
      } else {
        filmToggleBtn.querySelector('.btn-icon').textContent = '▶';
        filmToggleBtn.querySelector('.btn-text').textContent = 'Play Film';
        filmToggleBtn.classList.remove('active');
      }
    }
  }

  if (filmToggleBtn) filmToggleBtn.addEventListener('click', toggleFilmPlay);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space' && filmToggleBtn) {
      e.preventDefault();
      toggleFilmPlay();
    } else if (e.code === 'ArrowRight') {
      state.targetFrame = Math.min(TOTAL_FRAMES - 1, state.targetFrame + 1);
      syncScrollWithFrame(state.targetFrame);
    } else if (e.code === 'ArrowLeft') {
      state.targetFrame = Math.max(0, state.targetFrame - 1);
      syncScrollWithFrame(state.targetFrame);
    }
  });

  // --- Signature Palette Showroom Controller (Where Comfort Meets Style) ---
  const COLOR_PALETTES = {
    black: {
      image: 'assets/colors/black.png',
      title: 'Matte Black',
      desc: 'Experience the warmth and acoustic detail in every track! Lightweight all-day comfort with up to 50 hours of battery life.',
      accent: '#ffffff'
    },
    white: {
      image: 'assets/colors/white.png',
      title: 'Clean White',
      desc: 'Crisp architectural purity paired with cloud-soft cushions! Clean minimal aesthetic for modern creative listening.',
      accent: '#ffffff'
    },
    blue: {
      image: 'assets/colors/blue.png',
      title: 'Midnight Blue',
      desc: 'Deep celestial ocean tones with an electric edge! Rich metallic navy hue that adds a refined touch to your everyday audio.',
      accent: '#60a5fa'
    },
    grey: {
      image: 'assets/colors/grey.png',
      title: 'Titanium Grey',
      desc: 'Industrial precision and cool space-gray elegance! Engineered for understated sophistication in work and leisure.',
      accent: '#cbd5e1'
    },
    pink: {
      image: 'assets/colors/pink.png',
      title: 'Blush Pink',
      desc: 'Playful warmth with a delicate pastel glow! An energetic candy rose hue that brings vibrant creative confidence.',
      accent: '#f472b6'
    },
    red: {
      image: 'assets/colors/red.png',
      title: 'Crimson Red',
      desc: 'Unapologetic energy and bold sonic flair! A striking fiery ruby red that commands attention with velvety matte texture.',
      accent: '#f87171'
    },
    yelow: {
      image: 'assets/colors/yelow.png',
      title: 'Solar Yellow',
      desc: 'Radiant sunshine and high-energy contrast! Spirited golden citrus finish for bold trendsetters who make music a statement.',
      accent: '#facc15'
    }
  };

  // Preload all palette colorway images for instant texture display during rotation
  Object.values(COLOR_PALETTES).forEach(item => {
    const preImg = new Image();
    preImg.src = item.image;
  });

  const colorKeys = Object.keys(COLOR_PALETTES);
  let currentColorIndex = 0;
  let quantity = 1;

  const paletteStageCard = document.getElementById('palette-stage-card');
  const imgA = document.getElementById('palette-img-a');
  const imgB = document.getElementById('palette-img-b');
  const floaterWrap = document.getElementById('palette-floater-wrap');
  const orbitRingWire = document.getElementById('orbit-ring-wire');
  const paletteCircleBtns = document.querySelectorAll('.palette-circle-btn');
  const metaProductTitle = document.getElementById('meta-product-title');
  const metaDescription = document.getElementById('meta-description');
  const primaryBuyBtn = document.getElementById('primary-buy-btn');
  const orbitDialHandle = document.getElementById('orbit-dial-handle');
  const stepperDec = document.getElementById('stepper-dec');
  const stepperInc = document.getElementById('stepper-inc');
  const stepperCount = document.getElementById('stepper-count');
  const paletteAddBtn = document.getElementById('palette-add-btn');

  let activeSlot = 'A';
  let orbitTimer = null;

  function setPaletteColor(colorKey, direction = 'forward') {
    const data = COLOR_PALETTES[colorKey];
    if (!data) return;

    const newIndex = colorKeys.indexOf(colorKey);
    const activeImg = activeSlot === 'A' ? imgA : imgB;
    if (newIndex === currentColorIndex && activeImg && activeImg.src.includes(data.image)) return;

    if (direction === 'auto') {
      direction = newIndex >= currentColorIndex ? 'forward' : 'backward';
    }

    currentColorIndex = newIndex;

    paletteCircleBtns.forEach((btn) => {
      const isSelected = btn.dataset.color === colorKey;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    if (metaProductTitle) {
      metaProductTitle.textContent = `Sony WH-CH520 · ${data.title}`;
    }
    if (metaDescription) {
      metaDescription.textContent = data.desc;
    }
    if (primaryBuyBtn) {
      primaryBuyBtn.textContent = `Order Sony WH-CH520 · ${data.title}`;
    }

    // Dynamic backlight ambient spotlight tint for active colorway
    const ambientSpotlight = document.querySelector('.palette-ambient-spotlight');
    if (ambientSpotlight && data.accent) {
      ambientSpotlight.style.background = `radial-gradient(circle, ${data.accent}33 0%, ${data.accent}0f 45%, transparent 72%)`;
    }

    // Trigger single orbit ring wire pulse & dial handle spin
    if (orbitRingWire) {
      orbitRingWire.classList.remove('pulse');
      void orbitRingWire.offsetWidth;
      orbitRingWire.classList.add('pulse');
    }
    if (orbitDialHandle) {
      orbitDialHandle.classList.remove('spinning');
      void orbitDialHandle.offsetWidth;
      orbitDialHandle.classList.add('spinning');
      setTimeout(() => orbitDialHandle.classList.remove('spinning'), 400);
    }

    // Smooth Orbit Path Transition (Zero Tilt, Pure Natural Elliptical Arc)
    const currentImg = activeSlot === 'A' ? imgA : imgB;
    const incomingImg = activeSlot === 'A' ? imgB : imgA;

    if (currentImg && incomingImg) {
      if (orbitTimer) clearTimeout(orbitTimer);

      incomingImg.src = data.image;
      incomingImg.alt = `Sony WH-CH520 ${data.title}`;

      if (floaterWrap) {
        floaterWrap.classList.remove('idle-levitate');
        floaterWrap.classList.add('rotating-circle');
      }

      // Clear inline opacity so CSS keyframes execute freely
      currentImg.style.opacity = '';
      incomingImg.style.opacity = '';

      // Reset animation classes
      currentImg.className = 'palette-main-img';
      incomingImg.className = 'palette-main-img';

      void currentImg.offsetWidth;
      void incomingImg.offsetWidth;

      // Apply smooth curved orbit slide
      currentImg.classList.add(`orbit-slide-exit-${direction}`);
      incomingImg.classList.add(`orbit-slide-enter-${direction}`);

      // Flip active slot
      activeSlot = activeSlot === 'A' ? 'B' : 'A';

      orbitTimer = setTimeout(() => {
        currentImg.className = 'palette-main-img';
        currentImg.style.opacity = '0';
        incomingImg.className = 'palette-main-img active-slot';
        incomingImg.style.opacity = '1';

        if (floaterWrap) {
          floaterWrap.classList.remove('rotating-circle');
          floaterWrap.classList.add('idle-levitate');
        }
      }, 480);
    }
  }

  // Interactive Swatches: Click, Hover-Preview, and Arrow-Key Navigation
  paletteCircleBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const targetIndex = colorKeys.indexOf(btn.dataset.color);
      const dir = targetIndex >= currentColorIndex ? 'forward' : 'backward';
      setPaletteColor(btn.dataset.color, dir);
      btn.focus();
    });

    // Keyboard Arrow navigation for radio group
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (idx + 1) % colorKeys.length;
        setPaletteColor(colorKeys[nextIdx], 'forward');
        paletteCircleBtns[nextIdx]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (idx - 1 + colorKeys.length) % colorKeys.length;
        setPaletteColor(colorKeys[prevIdx], 'backward');
        paletteCircleBtns[prevIdx]?.focus();
      }
    });
  });

  function gotoPrevColor() {
    currentColorIndex = (currentColorIndex - 1 + colorKeys.length) % colorKeys.length;
    setPaletteColor(colorKeys[currentColorIndex], 'backward');
  }

  function gotoNextColor() {
    currentColorIndex = (currentColorIndex + 1) % colorKeys.length;
    setPaletteColor(colorKeys[currentColorIndex], 'forward');
  }

  const stagePrevBtn = document.getElementById('palette-stage-prev');
  const stageNextBtn = document.getElementById('palette-stage-next');
  const swatchPrevBtn = document.getElementById('swatch-nav-prev');
  const swatchNextBtn = document.getElementById('swatch-nav-next');

  if (stagePrevBtn) stagePrevBtn.addEventListener('click', gotoPrevColor);
  if (stageNextBtn) stageNextBtn.addEventListener('click', gotoNextColor);
  if (swatchPrevBtn) swatchPrevBtn.addEventListener('click', gotoPrevColor);
  if (swatchNextBtn) swatchNextBtn.addEventListener('click', gotoNextColor);

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowLeft') {
      gotoPrevColor();
    } else if (e.key === 'ArrowRight') {
      gotoNextColor();
    }
  });

  if (orbitDialHandle) {
    orbitDialHandle.addEventListener('click', gotoNextColor);
  }

  // --- Screen Touch / Hand Swipe & Drag Color Selection Controller ---
  const centerViewport = document.querySelector('.palette-center-viewport');
  if (centerViewport && floaterWrap) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentDeltaX = 0;
    let isHorizontalGesture = null;
    let startTime = 0;
    let pointerId = null;

    function onPointerDown(e) {
      // Ignore if user tapped directly on stage arrows or dial button
      if (e.target.closest('.palette-stage-arrow') || e.target.closest('#orbit-dial-handle')) {
        return;
      }
      if (e.button !== undefined && e.button !== 0) return;

      isDragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      currentDeltaX = 0;
      isHorizontalGesture = null;
      startTime = performance.now();

      floaterWrap.style.transition = 'none';
      floaterWrap.classList.add('is-touch-dragging');
      centerViewport.classList.add('is-dragging');

      try {
        centerViewport.setPointerCapture(pointerId);
      } catch (err) {}
    }

    function onPointerMove(e) {
      if (!isDragging || e.pointerId !== pointerId) return;

      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      // Detect if user intended a horizontal swipe vs vertical scroll
      if (isHorizontalGesture === null) {
        if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
          isHorizontalGesture = Math.abs(diffX) >= Math.abs(diffY);
        }
      }

      // If user is scrolling vertically up/down the page, yield to browser
      if (isHorizontalGesture === false) {
        return;
      }

      if (isHorizontalGesture === true) {
        currentDeltaX = diffX;
        // Damped physical curve so headphone travels with the finger
        const maxDrag = 150;
        const clampedDelta = Math.sign(diffX) * Math.min(Math.abs(diffX), maxDrag);
        const rotDeg = clampedDelta * 0.045;
        const yOffset = Math.abs(clampedDelta) * 0.055;

        floaterWrap.style.transform = `translate3d(${clampedDelta}px, ${yOffset}px, 0) rotate(${rotDeg}deg)`;
      }
    }

    function onPointerUp(e) {
      if (!isDragging || e.pointerId !== pointerId) return;
      isDragging = false;

      try {
        centerViewport.releasePointerCapture(pointerId);
      } catch (err) {}

      centerViewport.classList.remove('is-dragging');
      floaterWrap.classList.remove('is-touch-dragging');

      const elapsed = performance.now() - startTime;
      const velocity = Math.abs(currentDeltaX) / Math.max(elapsed, 1);

      // Threshold: dragged more than 35px or flicked quickly with finger
      const isSwipe = isHorizontalGesture === true && (Math.abs(currentDeltaX) > 35 || (Math.abs(currentDeltaX) > 15 && velocity > 0.35));

      if (isSwipe) {
        floaterWrap.style.transition = 'none';
        floaterWrap.style.transform = '';
        if (currentDeltaX < 0) {
          // Swiped finger left -> Next colorway
          gotoNextColor();
        } else {
          // Swiped finger right -> Previous colorway
          gotoPrevColor();
        }
      } else {
        // Check for quick direct tap to cycle
        const isQuickTap = Math.abs(currentDeltaX) < 10 && elapsed < 300;
        if (isQuickTap) {
          const rect = centerViewport.getBoundingClientRect();
          const clickXRel = e.clientX - rect.left;
          const ratio = clickXRel / rect.width;

          floaterWrap.style.transform = '';
          if (ratio < 0.32) {
            // Tapped left zone
            gotoPrevColor();
          } else if (ratio > 0.68) {
            // Tapped right zone
            gotoNextColor();
          } else {
            // Tapped center headphone -> cycle forward
            gotoNextColor();
          }
        } else {
          // Spring smoothly back to center resting position
          floaterWrap.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
          floaterWrap.style.transform = '';
        }
      }

      currentDeltaX = 0;
      isHorizontalGesture = null;
      pointerId = null;
    }

    centerViewport.addEventListener('pointerdown', onPointerDown);
    centerViewport.addEventListener('pointermove', onPointerMove);
    centerViewport.addEventListener('pointerup', onPointerUp);
    centerViewport.addEventListener('pointercancel', onPointerUp);
  }

  if (stepperDec) {
    stepperDec.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        if (stepperCount) stepperCount.textContent = quantity;
      }
    });
  }
  if (stepperInc) {
    stepperInc.addEventListener('click', () => {
      quantity++;
      if (stepperCount) stepperCount.textContent = quantity;
    });
  }

  if (paletteAddBtn) {
    paletteAddBtn.addEventListener('click', () => {
      paletteAddBtn.textContent = 'Added ✓';
      paletteAddBtn.style.background = '#30d158';
      paletteAddBtn.style.color = '#ffffff';
      setTimeout(() => {
        paletteAddBtn.textContent = 'Add to cart';
        paletteAddBtn.style.background = '#ffffff';
        paletteAddBtn.style.color = '#111113';
      }, 1400);
    });
  }

  // --- Interactive Hardware Feature Callouts Controller ---
  const hotspotContainer = document.getElementById('hotspot-container');
  const activeLine = document.getElementById('hotspot-active-line');
  const calloutBadges = document.querySelectorAll('.callout-pill-badge');
  const hotspotPoints = document.querySelectorAll('.hotspot-point');
  const hotspotNavPills = document.querySelectorAll('.hotspot-nav-pill');

  let calloutLeaveTimer = null;

  function clearAllCallouts() {
    calloutBadges.forEach((badge) => badge.classList.remove('active'));
    hotspotPoints.forEach((point) => point.classList.remove('active'));
    hotspotNavPills.forEach((pill) => pill.classList.remove('active'));
    if (activeLine) {
      activeLine.classList.remove('active');
      activeLine.setAttribute('points', '');
    }
  }

  function drawLeaderLine(key) {
    if (!hotspotContainer || !activeLine) return;
    const svgEl = document.getElementById('hotspot-svg-canvas');
    if (svgEl && (svgEl.offsetParent === null || getComputedStyle(svgEl).display === 'none')) return;
    const dot = document.querySelector(`.hotspot-point[data-point="${key}"]`);
    const badge = document.querySelector(`.callout-pill-badge[data-point="${key}"]`);
    if (!dot || !badge) return;

    const containerRect = hotspotContainer.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const badgeRect = badge.getBoundingClientRect();

    // Dot center in container relative coordinates
    const dotX = Math.round(dotRect.left + dotRect.width / 2 - containerRect.left);
    const dotY = Math.round(dotRect.top + dotRect.height / 2 - containerRect.top);

    // Badge anchor (if left column: right edge; if right column: left edge)
    const isLeft = badge.classList.contains('badge-left');
    const badgeX = isLeft
      ? Math.round(badgeRect.right - containerRect.left)
      : Math.round(badgeRect.left - containerRect.left);
    const badgeY = Math.round(badgeRect.top + badgeRect.height / 2 - containerRect.top);

    // Angled elbow midpoint
    const midX = isLeft
      ? Math.round(badgeX + (dotX - badgeX) * 0.45)
      : Math.round(badgeX - (badgeX - dotX) * 0.45);

    activeLine.setAttribute('points', `${badgeX},${badgeY} ${midX},${badgeY} ${dotX},${dotY}`);
    activeLine.classList.add('active');
  }

  function setActiveCallout(pointKey) {
    if (calloutLeaveTimer) {
      clearTimeout(calloutLeaveTimer);
      calloutLeaveTimer = null;
    }
    calloutBadges.forEach((badge) => {
      badge.classList.toggle('active', badge.dataset.point === pointKey);
    });
    hotspotPoints.forEach((point) => {
      point.classList.toggle('active', point.dataset.point === pointKey);
    });
    hotspotNavPills.forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.point === pointKey);
    });

    drawLeaderLine(pointKey);
  }

  function queueClearCallouts() {
    if (calloutLeaveTimer) clearTimeout(calloutLeaveTimer);
    calloutLeaveTimer = setTimeout(clearAllCallouts, 120);
  }

  // --- Pointing directly to the dots on the headphone ---
  hotspotPoints.forEach((point) => {
    const key = point.dataset.point;

    point.addEventListener('mouseenter', () => setActiveCallout(key));
    point.addEventListener('mouseleave', queueClearCallouts);

    point.addEventListener('focus', () => setActiveCallout(key));
    point.addEventListener('blur', queueClearCallouts);

    point.addEventListener('click', (e) => {
      e.stopPropagation();
      if (point.classList.contains('active')) {
        clearAllCallouts();
      } else {
        setActiveCallout(key);
      }
    });
  });

  // --- Hovering over the revealed badge keeps it visible ---
  calloutBadges.forEach((badge) => {
    const key = badge.dataset.point;

    badge.addEventListener('mouseenter', () => setActiveCallout(key));
    badge.addEventListener('mouseleave', queueClearCallouts);

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // --- Quick navigation pills below the stage ---
  hotspotNavPills.forEach((pill) => {
    const key = pill.dataset.point;

    pill.addEventListener('mouseenter', () => setActiveCallout(key));
    pill.addEventListener('mouseleave', queueClearCallouts);

    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pill.classList.contains('active')) {
        clearAllCallouts();
      } else {
        setActiveCallout(key);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#hotspot-container') && !e.target.closest('.hotspot-nav-bar')) {
      clearAllCallouts();
    }
  });

  window.addEventListener('resize', () => {
    const activePoint = document.querySelector('.hotspot-point.active');
    if (activePoint) {
      drawLeaderLine(activePoint.dataset.point);
    }
  });

  // --- Scroll-Triggered Feature Reveals & Number Count-Up Animations ---
  const featureRows = document.querySelectorAll('.feature-split-row');
  if (featureRows.length > 0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth cubic count-up animation
    function animateCounter(el, target, duration = 1000) {
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      const startTime = performance.now();
      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeProgress * target);
        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(updateCounter);
    }

    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const row = entry.target;
          row.classList.add('in-view');

          // Trigger smooth count-up for this row's hero stat number
          const counterEl = row.querySelector('.stat-counter');
          if (counterEl && !counterEl.dataset.hasCounted) {
            counterEl.dataset.hasCounted = 'true';
            const target = parseInt(counterEl.dataset.target, 10);
            if (!isNaN(target)) {
              animateCounter(counterEl, target, target > 20 ? 1000 : 700);
            }
          }

          featureObserver.unobserve(row);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px'
    });

    featureRows.forEach((row) => {
      featureObserver.observe(row);
    });
  }

  // --- Interactive Hotspot Explorer Entrance Animation Observer ---
  const explorerSection = document.getElementById('interactive-explorer');
  if (explorerSection) {
    const explorerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          explorerSection.classList.add('in-view');
          // Activate default hotspot callout smoothly
          setTimeout(() => {
            if (!document.querySelector('.hotspot-point.active')) {
              setActiveCallout('headband');
            }
          }, 600);
          explorerObserver.unobserve(explorerSection);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px'
    });
    explorerObserver.observe(explorerSection);
  }

  // --- Initialize ---
  preloadFrames();

})();
