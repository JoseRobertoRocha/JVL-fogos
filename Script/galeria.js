// Atualiza ano do footer
document.getElementById("y").textContent = new Date().getFullYear();

// Lightbox
const galleryImages = document.querySelectorAll(".gallery img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

galleryImages.forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.style.display = "flex";
  });
});

lightboxClose.addEventListener("click", () => {
  lightbox.style.display = "none";
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.style.display = "none";
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.style.display = "none";
  }
});

const gallery = document.querySelector(".gallery");
const images = document.querySelectorAll(".gallery img");
let index = 0;

// Carrossel automático
function showSlide() {
  index = (index + 1) % images.length;
  gallery.style.transform = `translateX(${-index * 100}%)`;
}
setInterval(showSlide, 4000); // muda a cada 4 segundos

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

images.forEach(img => {
  img.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImg.src = img.src;
  });
});

lightboxClose.onclick = () => lightbox.style.display = "none";
lightbox.onclick = e => { if(e.target === lightbox) lightbox.style.display = "none"; };