// ===== Ano no footer =====
document.getElementById("y").textContent = new Date().getFullYear();

// ===== Menu Mobile =====
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navLinks.classList.toggle("open");
});

// ===== Canvas de fogos =====
const canvas = document.getElementById("fireworks-canvas");
const ctx = canvas.getContext("2d");
let fireworks = [], particles = [], running = true;

// === Efeito de círculo de estrelas brilhantes ===
function spawnStarCircle(centerX, centerY) {
  // Se não passar coordenadas, sorteia um ponto aleatório (fallback)
  if (typeof centerX !== 'number' || typeof centerY !== 'number') {
    centerX = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
    centerY = Math.random() * canvas.height * 0.7 + canvas.height * 0.15;
  }
  const numStars = 36;
  const radius = 80 + Math.random() * 40;
  const color = 'white';
  for (let i = 0; i < numStars; i++) {
    const angle = (2 * Math.PI * i) / numStars;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    particles.push(new StarParticle(x, y, angle, centerX, centerY, color));
  }
}

class StarParticle {
  constructor(x, y, angle, centerX, centerY, color) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.angle = angle;
    this.radius = Math.hypot(x - centerX, y - centerY);
    this.color = color;
    this.life = 30 + Math.random() * 10;
    this.maxLife = this.life;
    this.size = 3 + Math.random() * 2;
    this.rotationSpeed = 0.12 + Math.random() * 0.08; // velocidade de rotação
    this.sparkTimer = 0;
    this.x = x;
    this.y = y;
  }
  update() {
    // Gira ao redor do centro
    this.angle += this.rotationSpeed;
    this.x = this.centerX + Math.cos(this.angle) * this.radius;
    this.y = this.centerY + Math.sin(this.angle) * this.radius;
    // Fade out e shrink
    this.life--;
    this.size *= 0.96;
    // Solta faíscas de fogos
    this.sparkTimer++;
    if (this.sparkTimer % 2 === 0 && this.life > 5) {
      for (let j = 0; j < 2; j++) {
        const sparkAngle = this.angle + (Math.random() - 0.5) * 0.5;
        const sparkSpeed = 2 + Math.random() * 2;
        particles.push(new SparkParticle(this.x, this.y, sparkAngle, sparkSpeed));
      }
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.life / this.maxLife, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#fff7b2';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

class SparkParticle {
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.life = 12 + Math.random() * 6;
    this.maxLife = this.life;
    this.size = 1.2 + Math.random() * 0.7;
    this.color = `hsl(${Math.random() * 60 + 40}, 100%, 60%)`;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.speed *= 0.93;
    this.life--;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.life / this.maxLife, 0.1);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// O efeito de círculo de estrelas agora é disparado junto com a explosão dos foguetes

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Firework {
  constructor(x, y, targetY, color) {
    this.x = x; this.y = y; this.targetY = targetY; this.color = color;
    this.speed = 5; this.exploded = false;
  }
  update() {
    if (this.y > this.targetY) { this.y -= this.speed; }
    else { this.explode(); this.exploded = true; }
  }
  explode() {
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 4 + 1; this.life = 100;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + 0.3;
    this.speed *= 0.96; this.life--;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(this.life / 100, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
function animate() {
  if (!running) return;
  ctx.fillStyle = "rgba(7,10,18,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fireworks.forEach((f, i) => { f.update(); f.draw(); if (f.exploded) fireworks.splice(i, 1); });
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update();
    p.draw();
    if (
      (p instanceof Particle && p.life <= 0) ||
      (typeof StarParticle !== 'undefined' && p instanceof StarParticle && p.life <= 0) ||
      (typeof SparkParticle !== 'undefined' && p instanceof SparkParticle && p.life <= 0)
    ) {
      particles.splice(i, 1); i--;
    }
  }
  requestAnimationFrame(animate);
}
setInterval(() => {
  let x = Math.random() * canvas.width;
  let color = `hsl(${Math.random() * 360},100%,50%)`;
  fireworks.push(new Firework(x, canvas.height, Math.random() * canvas.height / 2 + 100, color));
}, 1000);
animate();

// ===== Explosão ao clicar em botões/links =====
function explodeAt(x, y) {
  let color = `hsl(${Math.random() * 360},100%,50%)`;
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// Pega apenas botões e links que você tem no HTML
const clickable = document.querySelectorAll(
  "a.btn, a.cta-btn, .nav-links a, .hero-actions a"
);

clickable.forEach(el => {
  el.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    explodeAt(x, y);
  });
});

// === Popup de segurança ===
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");

// Quando clicar no card, abre popup
document.querySelectorAll("#produtos .card").forEach(card => {
  card.addEventListener("click", () => {
    const info = card.getAttribute("data-info");
    popupText.textContent = info;
    popup.style.display = "flex";
  });
});

// Fechar popup
popupClose.addEventListener("click", () => {
  popup.style.display = "none";
});

// Fechar clicando fora
popup.addEventListener("click", (e) => {
  if (e.target === popup) popup.style.display = "none";
});

function adaptScreen() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = (w / h).toFixed(2);

  // Definir no :root
  document.documentElement.style.setProperty("--screen-w", w + "px");
  document.documentElement.style.setProperty("--screen-h", h + "px");
  document.documentElement.style.setProperty("--screen-ratio", ratio);
}

// inicializar e reagir ao resize
window.addEventListener("load", adaptScreen);
window.addEventListener("resize", adaptScreen);
document.addEventListener("DOMContentLoaded", () => {
  const testimonials = document.querySelectorAll(".testimonial");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  let index = 0;
  let autoSlide;

  function showTestimonial(i) {
    testimonials.forEach((t, idx) => {
      t.classList.toggle("active", idx === i);
    });
  }

  function next() {
    index = (index + 1) % testimonials.length;
    showTestimonial(index);
  }

  function prev() {
    index = (index - 1 + testimonials.length) % testimonials.length;
    showTestimonial(index);
  }

  nextBtn.addEventListener("click", () => {
    next();
    resetAutoSlide();
  });
  prevBtn.addEventListener("click", () => {
    prev();
    resetAutoSlide();
  });

  function startAutoSlide() {
    autoSlide = setInterval(next, 5000); // troca a cada 5s
  }
  function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
  }

  // inicializa
  showTestimonial(index);
  startAutoSlide();
});

// localização 

async function getCityName(lat, lon) {
  try {
    // Usando Nominatim (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    return data.address.city || data.address.town || data.address.village || "sua cidade";
  } catch (error) {
    console.error("Erro ao buscar cidade:", error);
    return "sua cidade";
  }
}

function askLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const city = await getCityName(lat, lon);

      document.getElementById("city-title").textContent = `${city} merece brilho no céu!`;
    }, () => {
      document.getElementById("city-title").textContent = "Sua cidade merece brilho no céu!";
    });
  } else {
    document.getElementById("city-title").textContent = "Sua cidade merece brilho no céu!";
  }
}

// Executa ao carregar a página
window.onload = askLocation;

// depoimentos

