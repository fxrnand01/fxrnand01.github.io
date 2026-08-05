/* =========================================================
   NUESTRA HISTORIA — script.js
   Motor del libro 3D + panel de edición con localStorage
   ========================================================= */

(() => {
  const STORAGE_KEY = 'nuestraHistoria.v1';
  let storageAvailable = true;

  /* ---------- Contenido fijo (fotos incluidas en el proyecto) ---------- */
  const DEFAULT_PHOTOS = [
    { src: 'img/foto1.jpeg', caption: '', date: '' },
    { src: 'img/foto2.jpeg', caption: '', date: '' },
    { src: 'img/foto3.jpeg', caption: '', date: '' },
    { src: 'img/foto4.jpeg', caption: '', date: '' },
    { src: 'img/foto5.jpeg', caption: '', date: '' },
    { src: 'img/foto6.jpeg', caption: '', date: '' },
    { src: 'img/foto7.jpeg', caption: '', date: '' },
    { src: 'img/foto8.jpeg', caption: '', date: '' },
  ];

  const DEFAULT_TEXT = {
    headerName: 'Camila',
    coverTitle: 'Nuestra<br>Historia',
    coverSub: 'Camila &amp; Tú',
    welcomeTitle: 'Hola, mi amor',
    welcomeMsg: 'Este libro guarda nuestros recuerdos, nuestras fotos y todo lo que quiero decirte. Ábrelo con calma, cada página fue pensada para ti.',
    welcomeSign: 'Te quiero, hoy y siempre.',
    dedicTitle: 'Para ti',
    dedicMsg: 'Cada página de este libro es un pedacito de nosotros. Gracias por llenar mis días de color, de calma y de ganas de seguir escribiendo esta historia junto a ti.',
    backMsg: 'Esta historia sigue escribiéndose cada día que estoy contigo.',
  };

  /* ---------- Estado persistente (lo que ella/tú agreguen) ---------- */
  // Todas las fotos —incluidas las 8 originales del proyecto— viven en
  // state.photos para que se puedan editar/quitar desde el panel.
  function seedPhotos() {
    return DEFAULT_PHOTOS.map(p => ({ ...p }));
  }
  function defaultState() {
    return { photos: seedPhotos(), notes: [], text: {}, seeded: true };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const migrated = {
        photos: Array.isArray(parsed.photos) ? parsed.photos : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        text: typeof parsed.text === 'object' && parsed.text ? parsed.text : {},
        seeded: !!parsed.seeded,
      };
      // datos de una versión anterior sin migrar: antepone las fotos originales
      if (!migrated.seeded) {
        migrated.photos = [...seedPhotos(), ...migrated.photos];
        migrated.seeded = true;
      }
      return migrated;
    } catch (e) {
      console.warn('No se pudo leer localStorage:', e);
      storageAvailable = false;
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
      return true;
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
      storageAvailable = false;
      return false;
    }
  }

  let state = loadState();

  function text(key) {
    return (state.text && state.text[key]) || DEFAULT_TEXT[key];
  }

  /* ---------- Toast de aviso ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Construcción del contenido de páginas ---------- */
  function buildContentPages() {
    const pages = [];
    pages.push({ type: 'welcome' });
    state.photos.forEach(p => pages.push({ type: 'photo', ...p }));
    pages.push({ type: 'note', title: text('dedicTitle'), text: text('dedicMsg'), date: '' });
    state.notes.forEach(n => pages.push({ type: 'note', title: 'Un recuerdo más', text: n.text, date: n.date, dynamic: true }));
    return pages;
  }

  function buildLeavesData() {
    const content = buildContentPages();
    const backCover = { type: 'back' };
    const leaves = [];
    for (let i = 0; i < content.length; i += 2) {
      leaves.push({ front: content[i], back: content[i + 1] || null });
    }
    if (leaves.length && leaves[leaves.length - 1].back === null) {
      leaves[leaves.length - 1].back = backCover;
    } else {
      leaves.push({ front: backCover, back: null });
    }
    return leaves;
  }

  /* ---------- Render de una cara de página ---------- */
  const TILTS = ['-2.5deg', '1.5deg', '-1deg', '2deg', '-1.8deg'];

  function decorMotif(i) {
    // alterna entre lirio y peluche como firma decorativa
    return i % 3 === 2 ? 'teddyMotif' : 'lilyMotif';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  function renderPageContent(data, globalIndex) {
    const wrap = document.createElement('div');
    wrap.className = 'page-content';

    const corner = (cls, motif) => {
      const c = document.createElement('div');
      c.className = 'page-corner ' + cls;
      c.innerHTML = `<svg viewBox="0 0 200 260"><use href="#${motif}"></use></svg>`;
      return c;
    };

    if (!data || data.type === 'blank') {
      wrap.classList.add('page-blank');
      return wrap;
    }

    if (data.type === 'welcome') {
      wrap.classList.add('page-welcome');
      wrap.appendChild(corner('corner-tl', 'lilyMotif'));
      wrap.appendChild(corner('corner-br', 'teddyMotif'));
      wrap.innerHTML += `
        <p class="eyebrow">bienvenida</p>
        <h2>${escapeHtml(text('welcomeTitle'))}</h2>
        <p>${escapeHtml(text('welcomeMsg'))}</p>
        <p class="sign">${escapeHtml(text('welcomeSign'))}</p>
      `;
    } else if (data.type === 'photo') {
      wrap.classList.add('page-photo');
      const tilt = TILTS[globalIndex % TILTS.length];
      const frame = document.createElement('div');
      frame.className = 'photo-frame';
      frame.style.setProperty('--tilt', tilt);
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = data.caption || 'Foto de un recuerdo';
      img.loading = 'lazy';
      const tapeEl = document.createElement('div');
      tapeEl.className = 'tape';
      frame.appendChild(tapeEl);
      frame.appendChild(img);
      if (data.caption) {
        const cap = document.createElement('div');
        cap.className = 'polaroid-caption';
        cap.textContent = data.caption;
        frame.appendChild(cap);
      }
      wrap.appendChild(frame);
      if (data.date) {
        const d = document.createElement('div');
        d.className = 'photo-date';
        d.textContent = data.date;
        wrap.appendChild(d);
      }
    } else if (data.type === 'note') {
      wrap.classList.add('page-note');
      wrap.appendChild(corner('corner-tr', decorMotif(globalIndex)));
      const eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'dedicatoria';
      const h3 = document.createElement('h3');
      h3.textContent = data.title || 'Para ti';
      const p = document.createElement('div');
      p.className = 'note-text';
      p.textContent = data.text || '';
      wrap.appendChild(eyebrow);
      wrap.appendChild(h3);
      wrap.appendChild(p);
      if (data.date) {
        const d = document.createElement('div');
        d.className = 'note-date';
        d.textContent = data.date;
        wrap.appendChild(d);
      }
    } else if (data.type === 'back') {
      wrap.classList.add('page-back');
      wrap.innerHTML = `
        <svg class="cover-lily" viewBox="0 0 200 260"><use href="#lilyMotif"></use></svg>
        <h3>Continuar&aacute;...</h3>
        <p>${escapeHtml(text('backMsg'))}</p>
        <button class="heart-btn" type="button" id="backHeartBtn">Cerrar el libro</button>
      `;
      const heartBtn = wrap.querySelector('#backHeartBtn');
      heartBtn.addEventListener('click', (e) => {
        // evita que el clic también dispare el volteo de página del leaf padre
        e.stopPropagation();
        closeBook();
      });
    }

    return wrap;
  }

  /* ---------- Aplicar textos editables fuera del libro (portada/encabezado) ---------- */
  function applyStaticText() {
    const headerName = document.getElementById('coverNameDisplay');
    const coverTitle = document.getElementById('coverTitle');
    const coverSub = document.getElementById('coverSub');
    if (headerName) headerName.textContent = text('headerName');
    if (coverTitle) coverTitle.innerHTML = text('coverTitle');
    if (coverSub) coverSub.innerHTML = text('coverSub');
  }

  /* ---------- Motor del libro ---------- */
  const leavesEl = document.getElementById('leaves');
  const coverEl = document.getElementById('cover');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorEl = document.getElementById('pageIndicator');

  let leavesData = [];
  let opened = 0;
  let coverOpen = false;

  function render() {
    applyStaticText();
    leavesData = buildLeavesData();
    leavesEl.innerHTML = '';

    leavesData.forEach((leaf, i) => {
      const leafEl = document.createElement('div');
      leafEl.className = 'leaf';
      leafEl.dataset.index = i;

      const front = document.createElement('div');
      front.className = 'leaf-face face-front';
      front.appendChild(renderPageContent(leaf.front, i * 2));
      const num1 = document.createElement('div');
      num1.className = 'page-num';
      num1.textContent = leaf.front && leaf.front.type !== 'back' ? String(i * 2 + 1) : '';
      front.appendChild(num1);

      const back = document.createElement('div');
      back.className = 'leaf-face face-back';
      back.appendChild(renderPageContent(leaf.back, i * 2 + 1));
      const num2 = document.createElement('div');
      num2.className = 'page-num';
      num2.textContent = leaf.back && leaf.back.type !== 'back' ? String(i * 2 + 2) : '';
      back.appendChild(num2);

      leafEl.appendChild(front);
      leafEl.appendChild(back);
      leavesEl.appendChild(leafEl);

      leafEl.addEventListener('click', () => {
        if (isDragging) return;
        const idx = Number(leafEl.dataset.index);
        if (idx === opened) { flipForward(); }
        else if (idx === opened - 1) { flipBackward(); }
      });

      attachDrag(leafEl, i);
    });

    updateVisualState();
  }

  function updateVisualState() {
    const total = leavesData.length;
    leavesEl.querySelectorAll('.leaf').forEach((leafEl, i) => {
      const isFlipped = i < opened;
      leafEl.style.zIndex = isFlipped ? i + 1 : total - i;
      if (!leafEl.classList.contains('dragging')) {
        leafEl.style.transform = `rotateY(${isFlipped ? -180 : 0}deg)`;
      }
    });

    if (!coverOpen) {
      coverEl.style.transform = 'rotateY(0deg)';
      coverEl.style.zIndex = 200;
    } else {
      coverEl.style.transform = 'rotateY(-180deg)';
      coverEl.style.zIndex = 1;
    }

    prevBtn.disabled = opened === 0 && !coverOpen;
    nextBtn.disabled = coverOpen && opened >= total;

    if (!coverOpen) {
      indicatorEl.textContent = 'Portada';
    } else if (opened >= total) {
      indicatorEl.textContent = 'Fin';
    } else if (opened === 0) {
      indicatorEl.textContent = 'P\u00e1gina 1';
    } else {
      indicatorEl.textContent = `P\u00e1gina ${opened * 2} \u2013 ${opened * 2 + 1}`;
    }
  }

  function flipForward() {
    if (!coverOpen) {
      coverOpen = true;
      updateVisualState();
      tryPlayMusic();
      return;
    }
    if (opened < leavesData.length) { opened++; updateVisualState(); }
  }
  function flipBackward() {
    if (opened > 0) { opened--; updateVisualState(); return; }
    if (coverOpen) { coverOpen = false; updateVisualState(); }
  }

  prevBtn.addEventListener('click', flipBackward);
  nextBtn.addEventListener('click', flipForward);
  coverEl.addEventListener('click', () => { if (!isDragging) flipForward(); });

  function closeBook() {
    opened = 0;
    coverOpen = false;
    updateVisualState();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') flipForward();
    if (e.key === 'ArrowLeft') flipBackward();
  });

  /* ---------- Arrastre (pointer events) para voltear páginas ---------- */
  let isDragging = false;

  function attachDrag(leafEl, index) {
    let startX = 0;
    let dragging = false;
    let mode = null;

    leafEl.addEventListener('pointerdown', (e) => {
      const canForward = index === opened;
      const canBackward = index === opened - 1;
      if (!canForward && !canBackward) return;
      dragging = true;
      isDragging = false;
      mode = canForward ? 'forward' : 'backward';
      startX = e.clientX;
      leafEl.setPointerCapture(e.pointerId);
      leafEl.style.transition = 'none';
    });

    leafEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) isDragging = true;
      const wrapperWidth = leafEl.parentElement.clientWidth / 2 || 200;
      let deg;
      if (mode === 'forward') {
        deg = Math.max(-180, Math.min(0, (dx / wrapperWidth) * 180));
      } else {
        deg = Math.max(-180, Math.min(0, -180 + (dx / wrapperWidth) * 180));
      }
      leafEl.classList.add('dragging');
      leafEl.style.transform = `rotateY(${deg}deg)`;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      leafEl.classList.remove('dragging');
      leafEl.style.transition = '';
      const dx = (e.clientX || startX) - startX;
      const threshold = 60;
      if (mode === 'forward' && dx < -threshold) {
        flipForward();
      } else if (mode === 'backward' && dx > threshold) {
        flipBackward();
      } else {
        updateVisualState();
      }
      setTimeout(() => { isDragging = false; }, 50);
    }

    leafEl.addEventListener('pointerup', endDrag);
    leafEl.addEventListener('pointercancel', endDrag);
  }

  /* ---------- Música ---------- */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicWanted = false;

  function tryPlayMusic() {
    if (!bgMusic || !musicWanted) return;
    bgMusic.play().catch(() => { /* el navegador bloqueó el autoplay; se retoma al tocar el botón */ });
  }

  if (musicToggle && bgMusic) {
    bgMusic.volume = 0.55;
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        musicWanted = true;
        bgMusic.play().then(() => {
          musicToggle.classList.add('playing');
        }).catch(() => {
          showToast('Tu navegador bloqueó la reproducción automática. Vuelve a tocar el ícono de música.');
        });
      } else {
        bgMusic.pause();
        musicWanted = false;
        musicToggle.classList.remove('playing');
      }
    });
    bgMusic.addEventListener('error', () => {
      showToast('No se encontró musica.mp3. Verifica que esté en la misma carpeta que index.html.');
    });
  }

  /* ---------- Panel de administración ---------- */
  const adminToggle = document.getElementById('adminToggle');
  const adminModal = document.getElementById('adminModal');
  const adminClose = document.getElementById('adminClose');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const photoForm = document.getElementById('photoForm');
  const noteForm = document.getElementById('noteForm');
  const textForm = document.getElementById('textForm');
  const adminListItems = document.getElementById('adminListItems');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const photoEditHint = document.getElementById('photoEditHint');
  const photoSubmitBtn = document.getElementById('photoSubmitBtn');
  const photoCancelBtn = document.getElementById('photoCancelBtn');
  const noteSubmitBtn = document.getElementById('noteSubmitBtn');
  const noteCancelBtn = document.getElementById('noteCancelBtn');

  let editingPhotoIndex = null;
  let editingNoteIndex = null;

  function resetPhotoEditState() {
    editingPhotoIndex = null;
    photoEditHint.classList.add('hidden');
    photoCancelBtn.classList.add('hidden');
    photoSubmitBtn.textContent = 'Agregar página con esta foto';
  }
  function resetNoteEditState() {
    editingNoteIndex = null;
    noteCancelBtn.classList.add('hidden');
    noteSubmitBtn.textContent = 'Agregar página de dedicatoria';
  }

  function startEditPhoto(i) {
    const p = state.photos[i];
    if (!p) return;
    editingPhotoIndex = i;
    document.getElementById('photoFile').value = '';
    document.getElementById('photoUrl').value = '';
    document.getElementById('photoCaption').value = p.caption || '';
    document.getElementById('photoDate').value = p.date || '';
    photoEditHint.classList.remove('hidden');
    photoCancelBtn.classList.remove('hidden');
    photoSubmitBtn.textContent = 'Guardar cambios de la foto';
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'photo'));
    Object.keys(forms).forEach(key => forms[key].classList.toggle('hidden', key !== 'photo'));
  }

  function startEditNote(i) {
    const n = state.notes[i];
    if (!n) return;
    editingNoteIndex = i;
    document.getElementById('noteText').value = n.text || '';
    document.getElementById('noteDate').value = n.date || '';
    noteCancelBtn.classList.remove('hidden');
    noteSubmitBtn.textContent = 'Guardar cambios de la nota';
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'note'));
    Object.keys(forms).forEach(key => forms[key].classList.toggle('hidden', key !== 'note'));
  }

  photoCancelBtn.addEventListener('click', () => { photoForm.reset(); resetPhotoEditState(); });
  noteCancelBtn.addEventListener('click', () => { noteForm.reset(); resetNoteEditState(); });

  function openModal() {
    adminModal.classList.add('open');
    adminModal.setAttribute('aria-hidden', 'false');
    fillTextForm();
    renderAdminList();
  }
  function closeModal() {
    adminModal.classList.remove('open');
    adminModal.setAttribute('aria-hidden', 'true');
    photoForm.reset(); resetPhotoEditState();
    noteForm.reset(); resetNoteEditState();
  }
  adminToggle.addEventListener('click', openModal);
  adminClose.addEventListener('click', closeModal);
  adminModal.addEventListener('click', (e) => { if (e.target === adminModal) closeModal(); });

  const forms = { photo: photoForm, note: noteForm, text: textForm };
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      Object.keys(forms).forEach(key => forms[key].classList.toggle('hidden', key !== tab));
    });
  });

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  photoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('photoFile');
    const urlInput = document.getElementById('photoUrl');
    const captionInput = document.getElementById('photoCaption');
    const dateInput = document.getElementById('photoDate');

    let src = urlInput.value.trim();
    if (fileInput.files && fileInput.files[0]) {
      try {
        src = await fileToDataUrl(fileInput.files[0]);
      } catch (err) {
        showToast('No se pudo leer la imagen seleccionada.');
        return;
      }
    }

    if (editingPhotoIndex !== null) {
      const existing = state.photos[editingPhotoIndex];
      if (!existing) { resetPhotoEditState(); return; }
      state.photos[editingPhotoIndex] = {
        src: src || existing.src,
        caption: captionInput.value.trim(),
        date: dateInput.value.trim(),
      };
      const ok = saveState();
      photoForm.reset();
      resetPhotoEditState();
      render();
      renderAdminList();
      showToast(ok ? 'Foto actualizada ✨' : 'Foto actualizada, pero este navegador no permitió guardarla de forma permanente.');
      return;
    }

    if (!src) {
      showToast('Elige una foto de tu dispositivo o pega una URL de imagen.');
      return;
    }

    state.photos.push({
      src,
      caption: captionInput.value.trim(),
      date: dateInput.value.trim(),
    });
    const ok = saveState();
    photoForm.reset();
    render();
    renderAdminList();
    showToast(ok ? 'Foto agregada al libro ✨' : 'Foto agregada, pero este navegador no permitió guardarla de forma permanente.');
  });

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const noteTextInput = document.getElementById('noteText');
    const dateInput = document.getElementById('noteDate');
    const val = noteTextInput.value.trim();
    if (!val) {
      showToast('Escribe algo antes de agregarlo al libro.');
      return;
    }

    if (editingNoteIndex !== null) {
      if (!state.notes[editingNoteIndex]) { resetNoteEditState(); return; }
      state.notes[editingNoteIndex] = { text: val, date: dateInput.value.trim() };
      const ok = saveState();
      noteForm.reset();
      resetNoteEditState();
      render();
      renderAdminList();
      showToast(ok ? 'Dedicatoria actualizada ✨' : 'Dedicatoria actualizada, pero este navegador no permitió guardarla de forma permanente.');
      return;
    }

    state.notes.push({ text: val, date: dateInput.value.trim() });
    const ok = saveState();
    noteForm.reset();
    render();
    renderAdminList();
    showToast(ok ? 'Dedicatoria agregada ✨' : 'Dedicatoria agregada, pero este navegador no permitió guardarla de forma permanente.');
  });

  function fillTextForm() {
    document.getElementById('txtHeaderName').value = text('headerName');
    document.getElementById('txtCoverTitle').value = text('coverTitle').replace(/<br\s*\/?>/gi, '\n');
    document.getElementById('txtCoverSub').value = text('coverSub').replace(/&amp;/g, '&');
    document.getElementById('txtWelcomeTitle').value = text('welcomeTitle');
    document.getElementById('txtWelcomeMsg').value = text('welcomeMsg');
    document.getElementById('txtWelcomeSign').value = text('welcomeSign');
    document.getElementById('txtDedicTitle').value = text('dedicTitle');
    document.getElementById('txtDedicMsg').value = text('dedicMsg');
    document.getElementById('txtBackMsg').value = text('backMsg');
  }

  textForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.text = state.text || {};
    state.text.headerName = document.getElementById('txtHeaderName').value.trim() || DEFAULT_TEXT.headerName;
    state.text.coverTitle = (document.getElementById('txtCoverTitle').value.trim() || 'Nuestra\nHistoria').replace(/\n/g, '<br>');
    state.text.coverSub = document.getElementById('txtCoverSub').value.trim() || DEFAULT_TEXT.coverSub;
    state.text.welcomeTitle = document.getElementById('txtWelcomeTitle').value.trim() || DEFAULT_TEXT.welcomeTitle;
    state.text.welcomeMsg = document.getElementById('txtWelcomeMsg').value.trim() || DEFAULT_TEXT.welcomeMsg;
    state.text.welcomeSign = document.getElementById('txtWelcomeSign').value.trim() || DEFAULT_TEXT.welcomeSign;
    state.text.dedicTitle = document.getElementById('txtDedicTitle').value.trim() || DEFAULT_TEXT.dedicTitle;
    state.text.dedicMsg = document.getElementById('txtDedicMsg').value.trim() || DEFAULT_TEXT.dedicMsg;
    state.text.backMsg = document.getElementById('txtBackMsg').value.trim() || DEFAULT_TEXT.backMsg;
    const ok = saveState();
    render();
    showToast(ok ? 'Textos actualizados ✨' : 'Textos actualizados, pero este navegador no permitió guardarlos de forma permanente.');
  });

  /* ---------- Respaldo: exportar / importar ---------- */
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nuestra-historia-respaldo.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Respaldo descargado');
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = {
          photos: Array.isArray(parsed.photos) ? parsed.photos : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          text: typeof parsed.text === 'object' && parsed.text ? parsed.text : {},
          seeded: !!parsed.seeded,
        };
        if (!state.seeded) {
          state.photos = [...seedPhotos(), ...state.photos];
          state.seeded = true;
        }
        resetPhotoEditState();
        resetNoteEditState();
        saveState();
        render();
        fillTextForm();
        renderAdminList();
        showToast('Respaldo importado ✨');
      } catch (err) {
        showToast('Ese archivo no es un respaldo válido.');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  });

  function renderAdminList() {
    adminListItems.innerHTML = '';
    const items = [
      ...state.photos.map((p, i) => ({ label: p.caption || `Foto agregada #${i + 1}`, kind: 'photos', i })),
      ...state.notes.map((n, i) => ({ label: (n.text || '').slice(0, 28) + (n.text.length > 28 ? '…' : ''), kind: 'notes', i })),
    ];
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Todavía no has agregado recuerdos nuevos.';
      adminListItems.appendChild(li);
      return;
    }
    items.forEach(item => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = item.label;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => {
        if (item.kind === 'photos') startEditPhoto(item.i);
        else startEditNote(item.i);
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Quitar';
      removeBtn.addEventListener('click', () => {
        state[item.kind].splice(item.i, 1);
        saveState();
        render();
        renderAdminList();
      });

      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);
      li.appendChild(span);
      li.appendChild(actions);
      adminListItems.appendChild(li);
    });
  }

  if (!storageAvailable) {
    showToast('Este navegador no permite guardar datos aquí. Descarga un respaldo desde el panel de edición para no perder tus recuerdos.');
  }

  /* ---------- Inicio ---------- */
  render();
})();