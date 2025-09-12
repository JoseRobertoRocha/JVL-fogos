const WHATSAPP_NUMBER = "5575983130394"; 

const $ = (s, el=document)=>el.querySelector(s);
const $$ = (s, el=document)=>[...el.querySelectorAll(s)];

// ano no footer
$('#y').textContent = new Date().getFullYear();

// === Gate de idade ===
const ageGate = document.getElementById("ageGate");
const btnYes = document.getElementById("ageYes");
const btnNo = document.getElementById("ageNo");

// Se já aceitou antes
if (localStorage.getItem("ageVerified") === "true") {
  ageGate.classList.remove("show");
} else {
  ageGate.classList.add("show");
}

// Botão Tenho +18
btnYes?.addEventListener("click", () => {
  localStorage.setItem("ageVerified", "true");
  ageGate.classList.remove("show");
});

// Botão Sou menor
btnNo?.addEventListener("click", () => {
  alert("⚠️ Apenas para maiores de 18 anos.");
  window.location.href = "https://google.com";
});

// === Preços ===
$$('.product').forEach(card=>{
  const price=parseFloat(card.dataset.price||'0');
  const el=card.querySelector('[data-price-text]');
  if(el) el.textContent = price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
});

// === Carrinho ===
let cart=[];
const drawer=$('#cartDrawer'),
      openBtn=$('#openCart'),
      closeBtn=$('#closeCart'),
      backdrop=$('#cartBackdrop'),
      cartToggle=document.getElementById('cart-toggle');

function renderCart(){
  const list=$('#cartList'); list.innerHTML='';
  if(cart.length===0){ 
    list.innerHTML='<p class="muted">Seu carrinho está vazio.</p>'; 
  } else {
    cart.forEach(it=>{
      const div=document.createElement('div');
      div.className="cart-item";
      div.innerHTML=`
        <div class="name">${it.name}</div>
        <div class="line-right">
          <input type="number" min="1" value="${it.qty}" data-sku="${it.sku}">
          <button class="remove" data-sku="${it.sku}">Remover</button>
        </div>
        <div>Preço unit.: R$ ${it.price.toFixed(2)} | Subtotal: R$ ${(it.qty*it.price).toFixed(2)}</div>
      `;
      list.appendChild(div);
    });
  }
  $('#cartTotal').textContent="R$ "+cart.reduce((t,it)=>t+it.qty*it.price,0).toFixed(2);
  $('#cartCount').textContent=cart.reduce((t,it)=>t+it.qty,0);

  // eventos
  $$('.cart-item input').forEach(inp=>{
    inp.addEventListener('change',()=>{ setQty(inp.dataset.sku,parseInt(inp.value)); });
  });
  $$('.cart-item .remove').forEach(btn=>{
    btn.addEventListener('click',()=>{ removeItem(btn.dataset.sku); });
  });
}

function addToCart(sku,name,price,qty){
  qty=parseInt(qty)||1;
  const found=cart.find(i=>i.sku===sku);
  if(found) found.qty+=qty; else cart.push({sku,name,price,qty});
  renderCart();
}
function setQty(sku,qty){
  const it=cart.find(i=>i.sku===sku); 
  if(it){ it.qty=qty; renderCart(); }
}
function removeItem(sku){ 
  cart=cart.filter(i=>i.sku!==sku); 
  renderCart(); 
}

// === Popup quantidade ===
const qtyPopup=$('#qtyPopup');
const qtyInput=$('#qtyInput');
const confirmQty=$('#confirmQty');
const cancelQty=$('#cancelQty');

let pendingProduct=null;

$('#produtos').addEventListener('click',e=>{
  if(e.target.classList.contains('add-btn')){
    const card=e.target.closest('.product');
    pendingProduct={
      sku:card.dataset.sku,
      name:card.dataset.name,
      price:parseFloat(card.dataset.price)
    };
    qtyInput.value="1";
    qtyPopup.classList.add('show');
  }
});

confirmQty.addEventListener('click', ()=>{
  if(!pendingProduct) return;
  const qty=parseInt(qtyInput.value)||1;
  addToCart(pendingProduct.sku,pendingProduct.name,pendingProduct.price,qty);
  openCart();
  qtyPopup.classList.remove('show');
  pendingProduct=null;
});
cancelQty.addEventListener('click', ()=>{
  qtyPopup.classList.remove('show');
  pendingProduct=null;
});

// abrir/fechar drawer
function openCart(){ drawer.classList.add('open'); backdrop.classList.add('show'); }
function closeCart(){ drawer.classList.remove('open'); backdrop.classList.remove('show'); }
openBtn?.addEventListener('click',openCart);
closeBtn?.addEventListener('click',closeCart);
backdrop?.addEventListener('click',closeCart);

// botão flutuante
cartToggle?.addEventListener('click', ()=>{
  if(drawer.classList.contains('open')) closeCart();
  else openCart();
});

// Fecha com Esc
document.addEventListener('keydown',(e)=>{
  if(e.key==="Escape" && drawer.classList.contains('open')) closeCart();
});

// === Checkout WhatsApp ===
$('#checkout').addEventListener('click',()=>{
  if(cart.length===0) return alert("Carrinho vazio!");

  const nome=$('#clienteNome').value.trim();
  const email=$('#clienteEmail').value.trim();
  const doc=$('#clienteDoc').value.trim();

  if(!nome || !email){
    alert("⚠️ Nome e Email são obrigatórios!");
    return;
  }

  const itens=cart.map(it=>`${it.qty}x ${it.name} - R$ ${(it.qty*it.price).toFixed(2)}`).join("\n");
  const total="R$ "+cart.reduce((t,it)=>t+it.qty*it.price,0).toFixed(2);

  let msg=`*Novo Pedido*\n\n👤 Nome: ${nome}\n✉️ Email: ${email}`;
  if(doc) msg+=`\n🆔 CPF/CNPJ: ${doc}`;
  msg+=`\n\n📦 Produtos:\n${itens}\n\n💰 Total: ${total}`;

  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url,"_blank");

  cart=[]; renderCart();
  $('#clienteNome').value="";
  $('#clienteEmail').value="";
  $('#clienteDoc').value="";
  closeCart();
});

// inicializa
renderCart();

// === Lightbox ===
const lightbox=$('#lightbox');
const lightboxImg=$('#lightboxImg');
const lightboxClose=$('#lightboxClose');

$$('.product-media img').forEach(img=>{
  img.addEventListener('click', ()=>{
    lightboxImg.src=img.src;
    lightbox.classList.add('show');
  });
});
lightboxClose.addEventListener('click', ()=> lightbox.classList.remove('show'));
lightbox.addEventListener('click', e=>{
  if(e.target===lightbox) lightbox.classList.remove('show');
});

function openCart(){ 
  drawer.classList.add('open'); 
  backdrop.classList.add('show'); 
  document.querySelector('.cart-fab').style.display = 'none'; // esconde o FAB
}
function closeCart(){ 
  drawer.classList.remove('open'); 
  backdrop.classList.remove('show'); 
  document.querySelector('.cart-fab').style.display = 'flex'; // volta o FAB
}
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
});

