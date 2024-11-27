// Variables para el juego
let anchoCanvas = 800;
let altoCanvas = 400;
let xPelota, yPelota;
let velocidadXPelota = 3;
let velocidadYPelota = 3;
let incrementoVelocidad = 0.5;
let diametroPelota = 30;
let juegoPausado = true;
let velocidadMaximaPelota = 20;
let anguloPelota = 0; // Ángulo de rotación de la pelota

let mostrarDerrota = false; // Controla si se muestra la pantalla de derrota
let mostrarVictoria = false; // Controla si se muestra la pantalla de victoria
let confetiLanzado = false; // Controla si ya se lanzó el confeti
let narrado = false; // Controla si ya se narró el marcador

// Variables para las raquetas
let anchoRaqueta = 15;
let altoRaqueta = 150;

// Raqueta del jugador
let xJugador = 10;
let yJugador;
let raquetaJugadorVelocidad = 10;

// Raqueta de la computadora
let xComputadora;
let yComputadora;
let velocidadComputadora = 4;
let velocidadMaximaComputadora = 20;
let incrementoVelocidadRaqueta = 2;

// Puntuaciones
let puntosJugador = 0;
let puntosComputadora = 0;

// Imágenes y sonidos
let imgFondo, imgRaquetaJugador, imgRaquetaComputadora, imgPelota;
let sonidoDerrota, sonidoRebote; // Sonidos

function preload() {
    // Cargar las imágenes
    imgFondo = loadImage("Sprites/fondo1.png");
    imgRaquetaJugador = loadImage("Sprites/barra1.png");
    imgRaquetaComputadora = loadImage("Sprites/barra2.png");
    imgPelota = loadImage("Sprites/bola.png");

    // Cargar los sonidos
    sonidoDerrota = loadSound("Sprites/game_over.wav");
    sonidoRebote = loadSound("Sprites/bounce.wav");
}

function setup() {
    createCanvas(anchoCanvas, altoCanvas);
    reiniciarJuego();

    // Detectar eventos de teclado
    window.addEventListener("keydown", moverRaquetaJugadorKeyDown);
    window.addEventListener("keyup", moverRaquetaJugadorKeyUp);
    window.addEventListener("keydown", iniciarConEspacio);
}

function draw() {
    // Dibujar el fondo
    background(imgFondo);

    if (mostrarDerrota) {
        mostrarPantallaPerdida();
        return;
    }

    if (mostrarVictoria) {
        mostrarPantallaVictoria();
        return;
    }

    mostrarPuntuacion();

    if (juegoPausado) {
        mostrarMensajeInicio();
        if (!narrado) {
            narrarMarcador();
            narrado = true; // Se asegura de que narre una sola vez
        }
        return;
    }

    dibujarPelota();
    moverPelota();
    verificarColisionPared();

    dibujarRaqueta(xJugador, yJugador, imgRaquetaJugador);
    dibujarRaqueta(xComputadora, yComputadora, imgRaquetaComputadora);

    moverRaquetaJugador();
    moverRaquetaComputadora();

    verificarColisionRaqueta(xJugador, yJugador);
    verificarColisionRaqueta(xComputadora, yComputadora);
}
function narrarMarcador() {
    const mensaje = `El marcador está ${puntosJugador} a ${puntosComputadora}`;
    const narrador = new SpeechSynthesisUtterance(mensaje);
    narrador.lang = "es-ES"; // Idioma español
    window.speechSynthesis.speak(narrador);
}

// Función para dibujar la pelota
function dibujarPelota() {
    push(); // Guardar el estado actual de la transformación
    translate(xPelota, yPelota); // Mover el origen al centro de la pelota
    rotate(anguloPelota); // Aplicar la rotación basada en el ángulo actual
    imageMode(CENTER); // Asegurarse de que la imagen se dibuje desde su centro
    image(imgPelota, 0, 0, diametroPelota, diametroPelota); // Dibujar la imagen de la pelota
    pop(); // Restaurar el estado de la transformación
}

// Función para mover la pelota
function moverPelota() {
    xPelota += velocidadXPelota;
    yPelota += velocidadYPelota;

    // Calcular la velocidad total de la pelota
    let velocidadTotal = sqrt(velocidadXPelota ** 2 + velocidadYPelota ** 2);

    // Ajustar el ángulo de rotación según la velocidad total
    anguloPelota += map(velocidadTotal, 0, velocidadMaximaPelota, 0.05, 0.2);
}

// Generar una velocidad aleatoria para la raqueta de la CPU
function generarVelocidadAleatoriaCPU() {
    return random(5, velocidadMaximaComputadora); // Generar una velocidad entre 2 y el máximo definido
}

// Verificar colisiones con las paredes
function verificarColisionPared() {
    if (yPelota - diametroPelota / 2 < 0 || yPelota + diametroPelota / 2 > height) {
        velocidadYPelota *= -1;
    }

    if (xPelota - diametroPelota / 2 < 0) {
        puntosComputadora++;
        narrado = false; // Permitir narrar al inicio del juego
        manejarDerrota();
    } else if (xPelota + diametroPelota / 2 > width) {
        puntosJugador++;
        narrado = false; // Permitir narrar al inicio del juego
        manejarVictoria();
    }
}

// Manejar victoria del jugador
function manejarVictoria() {
    juegoPausado = true;
    mostrarVictoria = true;

    if (!confetiLanzado) {
        lanzarConfeti(); // Lanzar confeti al anotar un punto
        confetiLanzado = true; // Marcar como lanzado
    }

    // Reiniciar posiciones
    xPelota = xJugador + anchoRaqueta + diametroPelota / 2;
    yPelota = height / 2;
    yJugador = height / 2 - altoRaqueta / 2;
    xComputadora = width - anchoRaqueta - 30;
    yComputadora = height / 2 - altoRaqueta / 2;

    // Reiniciar velocidades
    velocidadXPelota = 3;
    velocidadYPelota = 3;
    velocidadComputadora = 4;
}

// Manejar derrota del jugador
function manejarDerrota() {
    juegoPausado = true;
    mostrarDerrota = true;

    if (sonidoDerrota.isLoaded()) {
        sonidoDerrota.play(); // Reproducir el sonido de derrota
    }

    // Reiniciar posiciones de la pelota y las raquetas
    yJugador = height / 2 - altoRaqueta / 2;
    yComputadora = height / 2 - altoRaqueta / 2;
    xPelota = xJugador + anchoRaqueta + diametroPelota / 2;
    yPelota = height / 2;

    // Reiniciar velocidades
    velocidadXPelota = 3;
    velocidadYPelota = 3;
    velocidadComputadora = 4;
}
// Dibujar las raquetas
function dibujarRaqueta(x, y, imgRaqueta) {
    imageMode(CORNER);
    image(imgRaqueta, x, y, anchoRaqueta, altoRaqueta);
}

// Control de la raqueta del jugador
function moverRaquetaJugador() {
    yJugador += raquetaJugadorVelocidad;

    if (yJugador < 0) {
        yJugador = 0;
    }

    if (yJugador + altoRaqueta > height) {
        yJugador = height - altoRaqueta;
    }
}

// Control de teclas para mover la raqueta del jugador
function moverRaquetaJugadorKeyDown(event) {
    if (event.key === "ArrowUp") {
        raquetaJugadorVelocidad = -10;
    } else if (event.key === "ArrowDown") {
        raquetaJugadorVelocidad = 10;
    }
}

function moverRaquetaJugadorKeyUp(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        raquetaJugadorVelocidad = 0;
    }
}

// Control de la raqueta de la computadora
function moverRaquetaComputadora() {
    if (yPelota < yComputadora) {
        yComputadora -= velocidadComputadora;
    } else if (yPelota > yComputadora + altoRaqueta) {
        yComputadora += velocidadComputadora;
    }

    if (yComputadora < 0) {
        yComputadora = 0;
    }
    if (yComputadora + altoRaqueta > height) {
        yComputadora = height - altoRaqueta;
    }
}

// Verificar colisiones con las raquetas
function verificarColisionRaqueta(x, y) {
    let izquierdaPelota = xPelota - diametroPelota / 2;
    let derechaPelota = xPelota + diametroPelota / 2;
    let arribaPelota = yPelota - diametroPelota / 2;
    let abajoPelota = yPelota + diametroPelota / 2;

    let izquierdaRaqueta = x;
    let derechaRaqueta = x + anchoRaqueta;
    let arribaRaqueta = y;
    let abajoRaqueta = y + altoRaqueta;

    if (
        derechaPelota > izquierdaRaqueta &&
        izquierdaPelota < derechaRaqueta &&
        abajoPelota > arribaRaqueta &&
        arribaPelota < abajoRaqueta
    ) {
        velocidadXPelota *= -1;

        velocidadXPelota += (velocidadXPelota > 0 ? incrementoVelocidad : -incrementoVelocidad);
        velocidadYPelota += (velocidadYPelota > 0 ? incrementoVelocidad : -incrementoVelocidad);

        velocidadXPelota = constrain(velocidadXPelota, -velocidadMaximaPelota, velocidadMaximaPelota);
        velocidadYPelota = constrain(velocidadYPelota, -velocidadMaximaPelota, velocidadMaximaPelota);

        if (sonidoRebote && sonidoRebote.isLoaded()) {
            sonidoRebote.play(); // Reproducir sonido al colisionar con ambas raquetas
        }

        // Cambiar la velocidad de la CPU al colisionar
        if (x === xComputadora) {
            velocidadComputadora = generarVelocidadAleatoriaCPU();
        }
    }
}

// Mostrar pantalla de derrota
function mostrarPantallaPerdida() {
    background(255, 0, 0);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(48);
    text("😢 HAS PERDIDO 😢", width / 2, height / 2);
    textSize(24);
    text("PRESIONA ESPACIO PARA CONTINUAR", width / 2, height / 2 + 50);
}

// Mostrar pantalla de victoria
function mostrarPantallaVictoria() {
    background(0, 0, 255);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(48);
    text("🎉 ¡PUNTO ANOTADO! 🎉", width / 2, height / 2);
    textSize(24);
    text("PRESIONA ESPACIO PARA CONTINUAR", width / 2, height / 2 + 50);
}

// Lanzar confeti al ganar
function lanzarConfeti() {
    if (typeof confetti === "function") {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#ff0", "#f00", "#0f0"],
        });
    }
}

// Mostrar puntuaciones
function mostrarPuntuacion() {
    fill(255);
    textSize(32);
    textAlign(CENTER, TOP);
    text(puntosJugador, width * 0.25, 20);
    text(puntosComputadora, width * 0.75, 20);
}

function iniciarConEspacio(event) {
    if (event.code === "Space") {
        if (mostrarDerrota) {
            mostrarDerrota = false;
        } else if (mostrarVictoria) {
            mostrarVictoria = false;
            confetiLanzado = false; // Resetear confeti
        } else if (juegoPausado) {
            juegoPausado = false;
        }
    }
}


// Mostrar mensaje de inicio
function mostrarMensajeInicio() {
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Presiona ESPACIO para empezar", width / 2, height / 2 + 50);
}

// Reiniciar posiciones
function reiniciarJuego() {
    xPelota = xJugador + anchoRaqueta + diametroPelota / 2;
    yPelota = height / 2;
    yJugador = height / 2 - altoRaqueta / 2;
    xComputadora = width - anchoRaqueta - 30;
    yComputadora = height / 2 - altoRaqueta / 2;
}
