// ===== Ano no footer =====
document.getElementById("y").textContent = new Date().getFullYear();

// ===== Menu Mobile =====
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navLinks.classList.toggle("open");
});

// ===== Canvas de fogos com otimizações =====
const canvas = document.getElementById("fireworks-canvas");
const ctx = canvas.getContext("2d");
let fireworks = [], particles = [], running = true;

// ===== Monitor de Performance =====
const PerformanceMonitor = {
  frameCount: 0,
  lastTime: 0,
  fps: 0,
  lowPerformanceThreshold: 30,
  
  update(currentTime) {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Auto-otimização baseada no FPS
      this.autoOptimize();
    }
  },
  
  autoOptimize() {
    if (this.fps < this.lowPerformanceThreshold) {
      // Reduz qualidade em dispositivos mais fracos
      FireworkSpawner.spawnRate = Math.min(FireworkSpawner.spawnRate + 200, 2000);
      
      // Limita partículas mais agressivamente
      if (particles.length > 500) {
        particles.splice(0, particles.length - 500);
      }
      
      console.log(`Performance baixa detectada (${this.fps} FPS). Otimizando...`);
    } else if (this.fps > 50 && FireworkSpawner.spawnRate > 1000) {
      // Melhora qualidade se o performance permite
      FireworkSpawner.spawnRate = Math.max(FireworkSpawner.spawnRate - 100, 1000);
    }
  }
};

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

// ===== Sistema de Canvas Otimizado =====
const CanvasManager = {
  resizeTimeout: null,
  
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Otimiza para diferentes densidades de pixel
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);
  },

  // Debounced resize para melhor performance
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resizeCanvas();
    }, 100);
  }
};

window.addEventListener("resize", () => CanvasManager.handleResize());
CanvasManager.resizeCanvas();

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
// ===== Sistema de Animação Otimizado =====
const AnimationManager = {
  lastTime: 0,
  targetFPS: 60,
  frameInterval: 1000 / 60,
  
  animate(currentTime) {
    if (!running) return;
    
    // Monitor de performance
    PerformanceMonitor.update(currentTime);
    
    // Controle de FPS para melhor performance
    if (currentTime - this.lastTime < this.frameInterval) {
      requestAnimationFrame((time) => this.animate(time));
      return;
    }
    
    this.lastTime = currentTime;
    
    // Limpa canvas com melhor performance
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = "rgba(7,10,18,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Otimiza loops para melhor performance
    this.updateFireworks();
    this.updateParticles();
    
    requestAnimationFrame((time) => this.animate(time));
  },

  updateFireworks() {
    // Processa fogos de artifício com melhor performance
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const f = fireworks[i];
      f.update();
      f.draw();
      if (f.exploded) {
        fireworks.splice(i, 1);
      }
    }
  },

  updateParticles() {
    // Limita número máximo de partículas para performance
    const maxParticles = 1000;
    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
    }

    // Processa partículas com melhor performance
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      if (
        (p instanceof Particle && p.life <= 0) ||
        (typeof StarParticle !== 'undefined' && p instanceof StarParticle && p.life <= 0) ||
        (typeof SparkParticle !== 'undefined' && p instanceof SparkParticle && p.life <= 0)
      ) {
        particles.splice(i, 1);
      }
    }
  }
};

// Inicia animação otimizada
requestAnimationFrame((time) => AnimationManager.animate(time));
// ===== Gerador de Fogos Otimizado =====
const FireworkSpawner = {
  interval: null,
  spawnRate: 1000, // ms entre fogos
  
  start() {
    this.interval = setInterval(() => {
      // Verifica se há muitos fogos para evitar sobrecarga
      if (fireworks.length < 10) {
        const x = Math.random() * canvas.width;
        const color = `hsl(${Math.random() * 360},100%,50%)`;
        fireworks.push(new Firework(x, canvas.height, Math.random() * canvas.height / 2 + 100, color));
      }
    }, this.spawnRate);
  },
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
};

// Inicia o gerador de fogos
FireworkSpawner.start();

// ===== Sistema de Explosões Interativas Otimizado =====
const InteractionManager = {
  throttleTimeout: null,
  
  explodeAt(x, y) {
    // Throttle para evitar muitas explosões simultâneas
    if (this.throttleTimeout) return;
    
    this.throttleTimeout = setTimeout(() => {
      this.throttleTimeout = null;
    }, 100);

    const color = `hsl(${Math.random() * 360},100%,50%)`;
    const particleCount = Math.min(60, 100 - particles.length); // Limita baseado no número atual
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
    
    // Adiciona efeito de círculo de estrelas ocasionalmente
    if (Math.random() < 0.3) {
      spawnStarCircle(x, y);
    }
  },

  handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.explodeAt(x, y);
  },

  init() {
    // Usa event delegation para melhor performance
    document.addEventListener("click", (e) => {
      const target = e.target.closest("a.btn, a.cta-btn, .nav-links a, .hero-actions a, .card");
      if (target) {
        this.handleClick(e);
      }
    });
  }
};

// Inicializa sistema de interações
InteractionManager.init();

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

// ===== Sistema de Adaptação de Tela Otimizado =====
const ScreenAdapter = {
  timeout: null,
  
  adaptScreen() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = (w / h).toFixed(2);

    // Otimização: usar requestAnimationFrame para melhor performance
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--screen-w", w + "px");
      document.documentElement.style.setProperty("--screen-h", h + "px");
      document.documentElement.style.setProperty("--screen-ratio", ratio);
    });
  },

  // Debounced para evitar múltiplas execuções
  handleResize() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.adaptScreen();
    }, 16); // ~60fps
  }
};

// Inicializar e reagir ao resize com melhor performance
window.addEventListener("load", () => ScreenAdapter.adaptScreen());
window.addEventListener("resize", () => ScreenAdapter.handleResize());
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

// ===== Sistema de Localização Otimizado =====
const LocationManager = {
  cache: new Map(),
  cacheTimeout: 30 * 60 * 1000, // 30 minutos
  fallbackCity: "Sua cidade",

  // Múltiplas APIs para melhor precisão
  async getCityFromNominatim(lat, lon) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR,pt,en`
    );
    const data = await response.json();
    
    // Prioriza cidades brasileiras e melhora a seleção
    const address = data.address || {};
    return address.city || 
           address.town || 
           address.municipality || 
           address.village || 
           address.hamlet || 
           address.suburb ||
           address.neighbourhood ||
           null;
  },

  async getCityFromOpenCage(lat, lon) {
    // Fallback API (requer chave, mas tem melhor precisão no Brasil)
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY&language=pt&countrycode=br`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const components = data.results[0].components;
        return components.city || components.town || components.village || null;
      }
    } catch (error) {
      console.warn("OpenCage API falhou:", error);
    }
    return null;
  },

  async getCityName(lat, lon) {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = this.cache.get(cacheKey);
    
    // Verifica cache válido
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.city;
    }

    try {
      // Tenta múltiplas APIs para melhor precisão
      let city = await this.getCityFromNominatim(lat, lon);
      
      if (!city) {
        city = await this.getCityFromOpenCage(lat, lon);
      }

      // Limpa e formata o nome da cidade
      if (city) {
        city = city.trim()
          .replace(/^(Município de|City of)\s+/i, '')
          .replace(/\s+/g, ' ');
        
        // Cache o resultado
        this.cache.set(cacheKey, {
          city,
          timestamp: Date.now()
        });
        
        return city;
      }
    } catch (error) {
      console.error("Erro ao buscar localização:", error);
    }

    return this.fallbackCity;
  },

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000 // Cache por 5 minutos
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  },

  async updateCityTitle() {
    const titleElement = document.getElementById("city-title");
    if (!titleElement) return;

    try {
      // Mostra loading
      titleElement.textContent = "Localizando...";
      
      const position = await this.getCurrentLocation();
      const { latitude: lat, longitude: lon } = position.coords;
      const city = await this.getCityName(lat, lon);
      
      // Animação suave para mudança do texto
      titleElement.style.opacity = '0.5';
      setTimeout(() => {
        titleElement.textContent = `${city} merece brilho no céu!`;
        titleElement.style.opacity = '1';
      }, 200);

    } catch (error) {
      console.warn("Não foi possível obter localização:", error.message);
      titleElement.textContent = "Sua cidade merece brilho no céu!";
    }
  }
};

// ===== Sistema de Visibilidade para Otimização =====
const VisibilityManager = {
  init() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Pausa animações quando aba não está ativa
        running = false;
        FireworkSpawner.stop();
      } else {
        // Resume animações quando aba fica ativa
        running = true;
        FireworkSpawner.start();
        requestAnimationFrame((time) => AnimationManager.animate(time));
      }
    });
    
    // Pausa/resume baseado no foco da janela
    window.addEventListener("blur", () => {
      running = false;
      FireworkSpawner.stop();
    });
    
    window.addEventListener("focus", () => {
      if (!document.hidden) {
        running = true;
        FireworkSpawner.start();
        requestAnimationFrame((time) => AnimationManager.animate(time));
      }
    });
  }
};

// ===== Inicialização Otimizada =====
document.addEventListener("DOMContentLoaded", () => {
  // Sistema de localização
  LocationManager.updateCityTitle();
  
  // Sistema de visibilidade
  VisibilityManager.init();
  
  // Preload apenas de imagens críticas
  const criticalImages = [
    "Ftsfogos/logoperfil.png", 
    "Ftsfogos/magia.png"
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});
