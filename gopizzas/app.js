const CONFIG = {
  whatsapp: "5551991040106",
  whatsappDisplay: "(51) 99104-0106",
  openingTime: "08:00",
  closingTime: "23:30",
  customPizzaPrice: 72.99,
  pickupAddress: "Rua Murá, 80 - Espírito Santo, Porto Alegre/RS"
};

const PRODUCTS = [
  {id:"calabresa",cat:"tradicionais",name:"Calabresa",desc:"Muçarela, calabresa, cebola e azeitonas.",price:59.90,image:"assets/mussarela.jpg"},
  {id:"portuguesa",cat:"tradicionais",name:"Portuguesa",desc:"Muçarela, presunto, cebola, tomate, pimentão, ovos de codorna e azeitonas.",price:59.90,image:"assets/hero_pc.jpg"},
  {id:"bacon-milho",cat:"tradicionais",name:"Bacon & Milho",desc:"Muçarela, bacon e milho.",price:59.90,image:"assets/bacom_milho.jpg"},

  {id:"4-queijos",cat:"especiais",name:"4 Queijos",desc:"Muçarela, provolone, gorgonzola e parmesão.",price:62.90,image:""},
  {id:"frango-requeijao",cat:"especiais",name:"Frango com Requeijão",desc:"Muçarela, frango desfiado, azeitonas e requeijão cremoso.",price:62.90,image:""},
  {id:"lombo",cat:"especiais",name:"Lombo",desc:"Muçarela, lombo, cebola, azeitonas e requeijão cremoso.",price:62.90,image:""},
  {id:"basca",cat:"especiais",name:"Basca",desc:"Muçarela, bacon, tomate, manjericão e requeijão cremoso.",price:62.90,image:""},
  {id:"bacon-especial",cat:"especiais",name:"Bacon Especial",desc:"Muçarela, bacon, cheddar e alho crocante.",price:62.90,image:""},

  {id:"carne-panela",cat:"premium",name:"Carne de Panela",desc:"Muçarela, carne de panela, cebola, azeitonas e cheddar.",price:69.90,image:""},
  {id:"coracao",cat:"premium",name:"Coração",desc:"Muçarela, coração, cebola e azeitonas.",price:69.90,image:""},

  {id:"chocolate-leite",cat:"doces",name:"Chocolate ao Leite",desc:"Chocolate ao leite.",price:29.90,size:"25 cm",image:""},
  {id:"chocolate-branco",cat:"doces",name:"Chocolate Branco",desc:"Chocolate branco.",price:29.90,size:"25 cm",image:""},
  {id:"mista",cat:"doces",name:"Mista",desc:"Chocolate ao leite e chocolate branco.",price:32.90,size:"25 cm",image:""},
  {id:"charge",cat:"doces",name:"Charge",desc:"Chocolate ao leite, doce de leite e amendoim.",price:32.90,size:"25 cm",image:""},
  {id:"ouro-branco",cat:"doces",name:"Ouro Branco",desc:"Chocolate branco e pedaços de Ouro Branco.",price:34.90,size:"25 cm",image:""},
  {id:"mms",cat:"doces",name:"M&M's",desc:"Chocolate ao leite ou chocolate branco e M&M's.",price:34.90,size:"25 cm",image:""},

  {id:"coca-cola-2l",cat:"bebidas",name:"Coca-Cola 2L",desc:"Refrigerante Coca-Cola 2 litros.",price:15.00,image:""},
  {id:"guarana-fruki-2l",cat:"bebidas",name:"Guaraná Fruki 2L",desc:"Refrigerante Guaraná Fruki 2 litros.",price:10.00,image:""}
];

const CAT = {
  tradicionais:{title:"Tradicionais",subtitle:"Pizzas artesanais • 35 cm"},
  especiais:{title:"Especiais",subtitle:"Pizzas artesanais • 35 cm"},
  premium:{title:"Premium",subtitle:"Pizzas artesanais • 35 cm"},
  doces:{title:"Pizzas doces",subtitle:"Pizzas artesanais • 25 cm"},
  bebidas:{title:"Bebidas",subtitle:"Para acompanhar seu pedido"}
};

let cart = JSON.parse(localStorage.getItem("goPizzasCart") || "[]");
let currentCategory = "tradicionais";
let currentProduct = null;
let selectedCustomFlavors = [];

const $ = id => document.getElementById(id);
const money = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const saveCart = () => localStorage.setItem("goPizzasCart", JSON.stringify(cart));

function renderProducts(){
  const info = CAT[currentCategory];
  $("categoryTitle").textContent = info.title;
  $("categorySubtitle").textContent = info.subtitle;
  $("productsGrid").innerHTML = PRODUCTS.filter(p=>p.cat===currentCategory).map(p=>`
    <article class="product-card">
      ${p.image ? `<img class="product-image" src="${p.image}" alt="${p.name}">` : '<div class="product-image-placeholder" aria-label="Local reservado para imagem"><span>Imagem do sabor</span></div>'}
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-price">${money(p.price)}</div>
      <div class="product-actions">
        <button class="add-btn" onclick="addProduct('${p.id}')">Adicionar</button>
        <button class="details-btn" onclick="openProduct('${p.id}')" aria-label="Ver detalhes">+</button>
      </div>
    </article>
  `).join("");
  document.querySelectorAll(".category-btn").forEach(b=>b.classList.toggle("active",b.dataset.category===currentCategory));
}

function renderCustomPizzaOptions(){
  const flavorProducts = PRODUCTS.filter(p=>p.cat!=="bebidas");
  $("customPizzaOptions").innerHTML = flavorProducts.map(p=>`
    <label class="custom-pizza-option">
      <input type="checkbox" value="${p.id}" data-custom-flavor>
      <span>${p.name}</span>
      <small>${CAT[p.cat].title}</small>
    </label>
  `).join("");
  document.querySelectorAll("[data-custom-flavor]").forEach(input=>input.addEventListener("change", updateCustomPizzaSelection));
}

function updateCustomPizzaSelection(){
  selectedCustomFlavors = [...document.querySelectorAll("[data-custom-flavor]:checked")].map(input=>input.value);
  const count = selectedCustomFlavors.length;
  $("customPizzaCount").textContent = count;
  $("addCustomPizzaBtn").disabled = count === 0;
  $("customPizzaFeedback").textContent = count === 4 ? "Limite de 4 sabores atingido." : "";
  document.querySelectorAll("[data-custom-flavor]:not(:checked)").forEach(input=>{
    input.disabled = count >= 4;
  });
}

function openCustomPizza(){
  selectedCustomFlavors = [];
  renderCustomPizzaOptions();
  updateCustomPizzaSelection();
  $("customPizzaModal").classList.add("show");
  $("customPizzaBackdrop").classList.add("show");
}

function closeCustomPizza(){
  $("customPizzaModal").classList.remove("show");
  $("customPizzaBackdrop").classList.remove("show");
}

function addCustomPizza(){
  const flavors = selectedCustomFlavors.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  if(!flavors.length) return;
  const note = `Sabores: ${flavors.map(flavor=>flavor.name).join(", ")}`;
  cart.push({
    id: `custom-pizza-${Date.now()}`,
    name: `Pizza montada (${flavors.length} ${flavors.length === 1 ? "sabor" : "sabores"})`,
    price: CONFIG.customPizzaPrice,
    qty: 1,
    note
  });
  saveCart();
  updateCart();
  closeCustomPizza();
  showToast("Pizza montada adicionada ao pedido");
}

function addProduct(id, note=""){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(x=>x.id===id && x.note===note);
  if(existing) existing.qty++;
  else cart.push({id:p.id,name:p.name,price:p.price,qty:1,note});
  saveCart(); updateCart(); showToast(`${p.name} adicionado ao pedido`);
}

function updateQty(index, delta){
  cart[index].qty += delta;
  if(cart[index].qty<=0) cart.splice(index,1);
  saveCart(); updateCart();
}

function removeItem(index){
  cart.splice(index,1); saveCart(); updateCart();
}

function clearCart(){
  if(!cart.length){
    showToast("O carrinho já está vazio.");
    return;
  }
  $("clearCartModal").classList.add("show");
  $("clearCartBackdrop").classList.add("show");
}

function closeClearCart(){
  $("clearCartModal").classList.remove("show");
  $("clearCartBackdrop").classList.remove("show");
}

function confirmClearCart(){
  cart = [];
  saveCart();
  updateCart();
  closeClearCart();
  showToast("Carrinho limpo.");
}

function cartTotal(){return cart.reduce((s,x)=>s+x.price*x.qty,0)}
function cartQty(){return cart.reduce((s,x)=>s+x.qty,0)}

function updateCart(){
  const total=cartTotal(), qty=cartQty();
  $("cartCount").textContent=qty;
  $("cartSubtotal").textContent=money(total);
  $("checkoutSubtotal").textContent=money(total);
  $("floatingTotal").textContent=money(total);
  if(!cart.length){
    $("cartContent").innerHTML='<div class="empty-cart"><div style="font-size:2.4rem">🍕</div><h3>Seu carrinho está vazio</h3><p>Escolha seus sabores favoritos para começar.</p></div>';
  }else{
    $("cartContent").innerHTML=cart.map((x,i)=>`
      <div class="cart-item">
        <div><h4>${x.name}</h4><p>${x.note?`Obs.: ${x.note}`:""}</p><div class="qty">
          <button onclick="updateQty(${i},-1)">−</button><strong>${x.qty}</strong><button onclick="updateQty(${i},1)">+</button>
        </div></div>
        <div class="cart-item-side"><strong>${money(x.price*x.qty)}</strong><br><button class="remove-item" onclick="removeItem(${i})">Remover</button></div>
      </div>
    `).join("");
  }
  updateOrderControls();
}

function openCart(){ $("cartDrawer").classList.add("open"); $("drawerBackdrop").classList.add("show"); }
function closeCart(){ $("cartDrawer").classList.remove("open"); $("drawerBackdrop").classList.remove("show"); }

function openProduct(id){
  currentProduct=PRODUCTS.find(x=>x.id===id);
  $("productModalContent").innerHTML=`
    <span class="eyebrow">${currentProduct.size||"35 cm"}</span>
    <h2>${currentProduct.name}</h2>
    <p style="color:#aaa">${currentProduct.desc}</p>
    <div class="price">${money(currentProduct.price)}</div>
    <label style="color:#bbb;font-size:.85rem">Observação
      <textarea id="productNote" placeholder="Ex.: sem cebola, bem assada..."></textarea>
    </label>
    <button class="btn btn-primary full" style="margin-top:14px" onclick="addFromModal()">Adicionar ao pedido</button>`;
  $("productModal").classList.add("show"); $("productModalBackdrop").classList.add("show");
}
function closeProduct(){ $("productModal").classList.remove("show"); $("productModalBackdrop").classList.remove("show"); }
function addFromModal(){addProduct(currentProduct.id,$("productNote").value.trim());closeProduct();}

function openCheckout(){
  if(!cart.length){showToast("Adicione pelo menos um item.");return}
  if(!isStoreOpen()){
    showToast("O estabelecimento está fechado no momento.");
    return;
  }
  closeCart(); $("checkoutModal").classList.add("show"); $("checkoutBackdrop").classList.add("show");
}
function closeCheckout(){ $("checkoutModal").classList.remove("show"); $("checkoutBackdrop").classList.remove("show"); }

function updateOrderType(){
  const delivery=document.querySelector('input[name="orderType"]:checked').value==="delivery";
  $("addressSection").style.display=delivery?"block":"none";
  ["street","number","neighborhood","city"].forEach(name=>{
    $("addressSection").querySelector(`[name="${name}"]`).required = delivery;
  });
}
function updatePayment(){
  $("changeField").style.display=document.querySelector('input[name="payment"]:checked').value==="Dinheiro"?"block":"none";
}

function buildWhatsAppMessage(data){
  const orderNumber = `GO-${Date.now().toString().slice(-6)}`;
  let msg=`🍕 *NOVO PEDIDO – GO PIZZAS*\n\n`;
  msg+=`*Pedido:* ${orderNumber}\n`;
  msg+=`*Cliente:* ${data.name}\n`;
  msg+=`*WhatsApp:* ${data.phone}\n\n`;
  msg+=`*PEDIDO:*\n`;
  msg+=cart.map(x=>{
    let item=`• ${x.qty}x ${x.name} — ${money(x.price*x.qty)}`;
    if(x.note) item+=`\n  Obs.: ${x.note}`;
    return item;
  }).join(`\n  · · ·\n`)+`\n`;
  msg+=`\n*Subtotal: ${money(cartTotal())}*\n`;
  if(data.orderType==="delivery"){
    msg+=`\n🛵 *ENTREGA*\n`;
    msg+=`*Endereço:* ${data.street}, ${data.number}`;
    if(data.complement) msg+=` - ${data.complement}`;
    msg+=`\n*Bairro:* ${data.neighborhood}\n*Cidade:* ${data.city}`;
    if(data.reference) msg+=`\n*Referência:* ${data.reference}`;
    msg+=`\n*Taxa de entrega:* a confirmar\n`;
  }else{
    msg+=`\n🏪 *RETIRADA NO LOCAL*\n${CONFIG.pickupAddress}\n`;
  }

  msg+=`\n💳 *Pagamento:* ${data.payment}\n`;
  if(data.payment==="Dinheiro" && data.change) msg+=`*Troco para:* ${data.change}\n`;
  if(data.generalNote) msg+=`\n📝 *Observação:* ${data.generalNote}\n`;
  msg+=`\n_Aguardo confirmação do pedido. Obrigado! 🍕_`;
  return encodeURIComponent(msg);
}

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

function getCheckoutData(){
  return Object.fromEntries(new FormData($("checkoutForm")).entries());
}

function renderOrderReview(data){
  const delivery = data.orderType === "delivery";
  const address = delivery
    ? `${data.street}, ${data.number}${data.complement ? ` - ${data.complement}` : ""}, ${data.neighborhood}, ${data.city}${data.reference ? ` (Ref.: ${data.reference})` : ""}`
    : CONFIG.pickupAddress;
  const items = cart.map(item=>`
    <div class="review-item">
      <span>${item.qty}x ${escapeHtml(item.name)}${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</span>
      <strong>${money(item.price * item.qty)}</strong>
    </div>
  `).join("");
  $("reviewOrderContent").innerHTML = `
    <section class="review-section"><h3>Itens do pedido</h3>${items}<div class="review-total"><span>Subtotal</span><strong>${money(cartTotal())}</strong></div></section>
    <section class="review-section"><h3>Cliente</h3><p><strong>Nome:</strong> ${escapeHtml(data.name)}</p><p><strong>WhatsApp:</strong> ${escapeHtml(data.phone)}</p></section>
    <section class="review-section"><h3>${delivery ? "Entrega" : "Retirada"}</h3><p>${escapeHtml(address)}</p></section>
    <section class="review-section"><h3>Pagamento</h3><p>${escapeHtml(data.payment)}${data.payment === "Dinheiro" && data.change ? ` — Troco para ${escapeHtml(data.change)}` : ""}</p></section>
    ${data.generalNote ? `<section class="review-section"><h3>Observações</h3><p>${escapeHtml(data.generalNote)}</p></section>` : ""}
  `;
}

function openOrderReview(){
  if(!isStoreOpen()){
    showToast("O estabelecimento está fechado no momento.");
    return;
  }
  const form = $("checkoutForm");
  if(!form.reportValidity()) return;
  renderOrderReview(getCheckoutData());
  $("reviewOrderModal").classList.add("show");
  $("reviewOrderBackdrop").classList.add("show");
}

function closeOrderReview(){
  $("reviewOrderModal").classList.remove("show");
  $("reviewOrderBackdrop").classList.remove("show");
}

function isStoreOpen(date = new Date()){
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [openingHour, openingMinute] = CONFIG.openingTime.split(":").map(Number);
  const [closingHour, closingMinute] = CONFIG.closingTime.split(":").map(Number);
  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;
  if (openingMinutes <= closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }
  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

function updateBusinessStatus(){
  const open = isStoreOpen();
  const statusText = open ? "Pedidos abertos" : "Pedidos encerrados, estabelecimento fechado";
  $("openStatus").innerHTML = `<span class="${open ? "" : "closed"}"></span> ${statusText}`;
  $("footerBusinessHours").textContent = `${CONFIG.openingTime} às ${CONFIG.closingTime}`;
  $("footerStatus").textContent = open ? "● Aberto agora" : "● Fechado agora";
  $("footerStatus").classList.toggle("is-open", open);
  updateOrderControls();
}

function updateOrderControls(){
  const open = isStoreOpen();
  const hasItems = cart.length > 0;
  $("cartClosedNotice").hidden = open;
  $("checkoutBtn").disabled = !hasItems || !open;
  $("checkoutBtn").style.opacity = hasItems && open ? "1" : ".45";
  $("checkoutBtn").title = open ? "" : "Pedidos indisponíveis: estabelecimento fechado";
  $("checkoutModal").querySelector(".send-order").disabled = !open;
  $("checkoutModal").querySelector(".send-order").title = open ? "" : "Pedidos indisponíveis: estabelecimento fechado";
}

$("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!isStoreOpen()){showToast("Os pedidos estão encerrados no momento.");return;}
  const fd=new FormData(e.target);
  const data=Object.fromEntries(fd.entries());
  const message=buildWhatsAppMessage(data);
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${message}`,"_blank","noopener");
});

document.querySelectorAll(".category-btn").forEach(btn=>btn.addEventListener("click",()=>{
  if(btn.dataset.category==="montar"){
    openCustomPizza();
    return;
  }
  currentCategory=btn.dataset.category; renderProducts();
  document.getElementById("escolha-sabor").scrollIntoView({behavior:"smooth",block:"start"});
}));
$("openCartBtn").onclick=openCart; $("floatingCart").onclick=openCart; $("closeCartBtn").onclick=closeCart; $("drawerBackdrop").onclick=closeCart;
$("continueBtn").onclick=closeCart; $("checkoutBtn").onclick=openCheckout; $("clearCartBtn").onclick=clearCart;
$("closeProductModal").onclick=closeProduct; $("productModalBackdrop").onclick=closeProduct;
$("closeClearCartModal").onclick=closeClearCart; $("cancelClearCartBtn").onclick=closeClearCart;
$("clearCartBackdrop").onclick=closeClearCart; $("confirmClearCartBtn").onclick=confirmClearCart;
$("closeCustomPizzaModal").onclick=closeCustomPizza; $("customPizzaBackdrop").onclick=closeCustomPizza;
$("addCustomPizzaBtn").onclick=addCustomPizza;
$("refreshStatusBtn").onclick=()=>window.location.reload();
$("reviewOrderBtn").onclick=openOrderReview;
$("closeReviewOrderModal").onclick=closeOrderReview; $("reviewOrderBackdrop").onclick=closeOrderReview;
$("editOrderBtn").onclick=closeOrderReview;
$("closeCheckoutModal").onclick=closeCheckout; $("checkoutBackdrop").onclick=closeCheckout;
document.querySelectorAll('input[name="orderType"]').forEach(x=>x.addEventListener("change",updateOrderType));
document.querySelectorAll('input[name="payment"]').forEach(x=>x.addEventListener("change",updatePayment));

$("year").textContent=new Date().getFullYear();
renderProducts(); updateCart(); updateOrderType(); updatePayment(); updateBusinessStatus();
setInterval(updateBusinessStatus, 30000);

function showToast(text){
  let t=document.querySelector(".toast"); if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}
  t.textContent=text;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),1800);
}

function enableBasicProtection(){
  document.addEventListener("contextmenu", event=>{
    if(!event.target.closest("input, textarea, select, button, a")) event.preventDefault();
  });
  document.addEventListener("copy", event=>{
    if(!event.target.closest("input, textarea")) event.preventDefault();
  });
  document.addEventListener("cut", event=>{
    if(!event.target.closest("input, textarea")) event.preventDefault();
  });
  document.addEventListener("dragstart", event=>{
    if(event.target.closest("img")) event.preventDefault();
  });
  document.addEventListener("keydown", event=>{
    const key = event.key.toLowerCase();
    const blockedShortcut = event.key === "F12"
      || (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key))
      || (event.ctrlKey && key === "u");
    if(blockedShortcut){
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

enableBasicProtection();
