// ==========================================================
// CONTENIDO DE LAS CARTAS
// Edita aquí los títulos y textos de cada carta.
// ==========================================================

const CARTAS = {
  1: {
    titulo: "Sobre nosotros",
    parrafos: [
      "No sé exactamente cuándo pasó, pero en algún momento dejaste de ser una persona más para convertirte en mi lugar favorito.",
      "Me gusta pensar en todo lo que hemos construido, en las conversaciones largas, en las risas tontas y en los silencios cómodos.",
      "Esta es apenas una página de todo lo que quiero seguir escribiendo contigo."
    ]
  },
  2: {
    titulo: "Gracias",
    parrafos: [
      "Gracias por tu paciencia, por tu forma de cuidarme sin que yo lo pida, y por hacer que los días difíciles pesen menos.",
      "Gracias por cada pequeño detalle que probablemente ni recuerdas, pero que yo guardo con mucho cariño.",
      "Simplemente, gracias por estar."
    ]
  },
  3: {
    titulo: "Lo que viene",
    parrafos: [
      "Quiero seguir llenando este álbum contigo: más fotos torpes, más canciones que se vuelvan 'nuestras'.",
      "No tengo todas las respuestas sobre el futuro, pero sí tengo claro con quién quiero recorrerlo.",
      "Que esto sea solo el comienzo."
    ]
  }
};


// ==========================================================
// ESTRELLAS DE FONDO
// ==========================================================

function crearEstrellas() {
  const contenedor = document.getElementById("estrellas");
  if (!contenedor) return;

  const cantidad = window.innerWidth < 600 ? 40 : 80;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < cantidad; i++) {
    const estrella = document.createElement("span");
    estrella.style.left = Math.random() * 100 + "vw";
    estrella.style.top = Math.random() * 100 + "vh";
    estrella.style.setProperty("--dur", `${3 + Math.random() * 4}s`);
    estrella.style.setProperty("--delay", `-${Math.random() * 5}s`);
    frag.appendChild(estrella);
  }
  contenedor.appendChild(frag);
}

crearEstrellas();


// ==========================================================
// PÉTALOS FLOTANTES
// ==========================================================

function crearPetalos() {
  const contenedor = document.getElementById("petalos");
  if (!contenedor) return;

  const cantidad = window.innerWidth < 600 ? 10 : 18;

  for (let i = 0; i < cantidad; i++) {
    const petalo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    petalo.classList.add("petalo");
    petalo.setAttribute("viewBox", "0 0 60 60");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#petalo");
    petalo.appendChild(use);

    const tam = 10 + Math.random() * 14;
    const duracionCaida = 14 + Math.random() * 12;
    const duracionVaiven = 3 + Math.random() * 3;
    const retraso = Math.random() * 20;

    petalo.style.width = tam + "px";
    petalo.style.height = tam + "px";
    petalo.style.left = Math.random() * 100 + "vw";
    petalo.style.animationDuration = `${duracionCaida}s, ${duracionVaiven}s`;
    petalo.style.animationDelay = `-${retraso}s, -${retraso}s`;

    contenedor.appendChild(petalo);
  }
}

crearPetalos();


// ==========================================================
// REVEAL AL HACER SCROLL
// ==========================================================

function activarRevelado() {
  const elementos = document.querySelectorAll(".reveal");
  elementos.forEach((el, i) => el.style.setProperty("--i", i % 8));

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  elementos.forEach((el) => observador.observe(el));
}

activarRevelado();


// ==========================================================
// INTRO — SOBRE SELLADO
// ==========================================================

const intro = document.getElementById("intro");
const sobre = document.getElementById("sobre");

function abrirSobre() {
  if (!sobre || sobre.classList.contains("abriendo")) return;
  sobre.classList.add("abriendo");
  iniciarMusica();

  setTimeout(() => {
    intro.classList.add("cerrado");
    document.body.classList.remove("bloqueado");
  }, 900);
}

if (sobre) {
  document.body.classList.add("bloqueado");
  sobre.addEventListener("click", abrirSobre);
  sobre.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirSobre();
    }
  });
}


// ==========================================================
// ABRIR ÁLBUM (scroll a galería)
// ==========================================================

const abrirAlbum = document.getElementById("abrirAlbum");
const galeria = document.getElementById("galeria");

if (abrirAlbum) {
  abrirAlbum.addEventListener("click", () => {
    galeria.scrollIntoView({ behavior: "smooth" });
  });
}


// ==========================================================
// NAVEGACIÓN POR PUNTOS + SCROLLSPY
// ==========================================================

const puntos = document.querySelectorAll(".punto");
const secciones = ["portada", "galeria", "cancion", "cartas"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if (secciones.length && puntos.length) {
  const observadorNav = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          puntos.forEach((p) => p.classList.remove("activo"));
          const activo = document.querySelector(`.punto[data-target="${entrada.target.id}"]`);
          if (activo) activo.classList.add("activo");
        }
      });
    },
    { threshold: 0.5 }
  );

  secciones.forEach((s) => observadorNav.observe(s));
}


// ==========================================================
// REPRODUCTOR DE MÚSICA PERSONALIZADO
// ==========================================================

const musica = document.getElementById("musica");
const playPause = document.getElementById("playPause");
const iconoPlay = document.getElementById("iconoPlay");
const iconoPausa = document.getElementById("iconoPausa");
const disco = document.getElementById("disco");
const ecualizador = document.getElementById("ecualizador");
const barraProgreso = document.getElementById("barraProgreso");
const barraRelleno = document.getElementById("barraRelleno");
const tiempoActual = document.getElementById("tiempoActual");
const tiempoTotal = document.getElementById("tiempoTotal");
const botonSonido = document.getElementById("botonSonido");
const iconoSonidoOn = document.getElementById("iconoSonidoOn");
const iconoSonidoOff = document.getElementById("iconoSonidoOff");

function formatearTiempo(segundos) {
  if (!isFinite(segundos)) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

function actualizarIconos(reproduciendo) {
  iconoPlay.style.display = reproduciendo ? "none" : "block";
  iconoPausa.style.display = reproduciendo ? "block" : "none";
  disco.classList.toggle("girando", reproduciendo);
  ecualizador.classList.toggle("activo", reproduciendo);
}

function iniciarMusica() {
  if (!musica) return;
  musica.volume = 0.7;
  musica.play()
    .then(() => actualizarIconos(true))
    .catch((error) => console.warn("No se pudo reproducir la música automáticamente:", error));
}

if (playPause && musica) {
  playPause.addEventListener("click", () => {
    if (musica.paused) {
      musica.play().then(() => actualizarIconos(true));
    } else {
      musica.pause();
      actualizarIconos(false);
    }
  });

  musica.addEventListener("loadedmetadata", () => {
    tiempoTotal.textContent = formatearTiempo(musica.duration);
  });

  musica.addEventListener("timeupdate", () => {
    tiempoActual.textContent = formatearTiempo(musica.currentTime);
    if (musica.duration) {
      barraRelleno.style.width = `${(musica.currentTime / musica.duration) * 100}%`;
    }
  });

  musica.addEventListener("ended", () => actualizarIconos(false));

  barraProgreso.addEventListener("click", (evento) => {
    const rect = barraProgreso.getBoundingClientRect();
    const proporcion = (evento.clientX - rect.left) / rect.width;
    if (musica.duration) {
      musica.currentTime = proporcion * musica.duration;
    }
  });
}

if (botonSonido && musica) {
  botonSonido.addEventListener("click", () => {
    musica.muted = !musica.muted;
    iconoSonidoOn.style.display = musica.muted ? "none" : "block";
    iconoSonidoOff.style.display = musica.muted ? "block" : "none";
  });
}


// ==========================================================
// VISOR DE FOTOS (con navegación anterior / siguiente)
// ==========================================================

const fotos = Array.from(document.querySelectorAll(".foto"));
const visorFoto = document.getElementById("visorFoto");
const visorImagen = document.getElementById("visorImagen");
const visorTitulo = document.getElementById("visorTitulo");
const visorTexto = document.getElementById("visorTexto");
const visorContador = document.getElementById("visorContador");
const cerrarVisorFoto = document.getElementById("cerrarVisorFoto");
const fotoAnterior = document.getElementById("fotoAnterior");
const fotoSiguiente = document.getElementById("fotoSiguiente");

let indiceFotoActual = 0;

function mostrarFoto(indice) {
  if (!fotos.length) return;
  indiceFotoActual = (indice + fotos.length) % fotos.length;
  const foto = fotos[indiceFotoActual];
  const img = foto.querySelector("img");

  visorImagen.style.display = foto.classList.contains("sin-imagen") ? "none" : "block";
  visorImagen.src = img ? img.src : "";
  visorTitulo.textContent = foto.dataset.titulo || "";
  visorTexto.textContent = foto.dataset.texto || "";
  visorContador.textContent = `${indiceFotoActual + 1} / ${fotos.length}`;
}

function abrirVisorFoto(indice) {
  mostrarFoto(indice);
  visorFoto.classList.add("abierto");
  visorFoto.setAttribute("aria-hidden", "false");
}

function cerrarTodosLosVisores() {
  document.querySelectorAll(".visor.abierto").forEach((v) => {
    v.classList.remove("abierto");
    v.setAttribute("aria-hidden", "true");
  });
}

fotos.forEach((foto, indice) => {
  foto.addEventListener("click", () => abrirVisorFoto(indice));
});

if (cerrarVisorFoto) cerrarVisorFoto.addEventListener("click", cerrarTodosLosVisores);
if (fotoAnterior) fotoAnterior.addEventListener("click", () => mostrarFoto(indiceFotoActual - 1));
if (fotoSiguiente) fotoSiguiente.addEventListener("click", () => mostrarFoto(indiceFotoActual + 1));


// ==========================================================
// VISOR DE CARTAS
// ==========================================================

const cartas = document.querySelectorAll(".carta");
const visorCarta = document.getElementById("visorCarta");
const cartaTituloGrande = document.getElementById("cartaTituloGrande");
const cartaCuerpo = document.getElementById("cartaCuerpo");
const cerrarVisorCarta = document.getElementById("cerrarVisorCarta");

cartas.forEach((carta) => {
  carta.addEventListener("click", () => {
    const datos = CARTAS[carta.dataset.carta];
    if (!datos) return;

    cartaTituloGrande.textContent = datos.titulo;
    cartaCuerpo.innerHTML = datos.parrafos.map((p) => `<p>${p}</p>`).join("");

    visorCarta.classList.add("abierto");
    visorCarta.setAttribute("aria-hidden", "false");
  });
});

if (cerrarVisorCarta) cerrarVisorCarta.addEventListener("click", cerrarTodosLosVisores);


// ==========================================================
// CERRAR VISORES AL HACER CLIC AFUERA O CON ESC / FLECHAS
// ==========================================================

[visorFoto, visorCarta].forEach((visor) => {
  if (!visor) return;
  visor.addEventListener("click", (evento) => {
    if (evento.target === visor) cerrarTodosLosVisores();
  });
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") cerrarTodosLosVisores();

  if (visorFoto.classList.contains("abierto")) {
    if (evento.key === "ArrowRight") mostrarFoto(indiceFotoActual + 1);
    if (evento.key === "ArrowLeft") mostrarFoto(indiceFotoActual - 1);
  }
});
