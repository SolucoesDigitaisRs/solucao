const WHATSAPP = "5551980438920";
const categorias = [
  {nome:"Todos",icone:"✨",descricao:"Ver tudo"},
  {nome:"Brindes",icone:"🎁",descricao:"Presentes e ações"},
  {nome:"Vestuário",icone:"👜",descricao:"Couro, bolsas, Carteiras"},
  {nome:"Papelaria",icone:"📚",descricao:"Agendas e cadernos"},
  {nome:"Chaveiro",icone:"🔑",descricao:"Chaveiros personalizados"},
  {nome:"MDF & Laser",icone:"🪵",descricao:"Corte e gravação"},
  {nome:"Adesivos",icone:"🏷️",descricao:"Adesivos e DTF"}
];
let categoriaAtual = "Todos";
const productRows = document.querySelector("#productRows");
const filterRow = document.querySelector("#filterRow");
const categoryGrid = document.querySelector("#categoryGrid");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");

function whatsappUrl(mensagem){
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

function renderCategorias(){
  categoryGrid.innerHTML = categorias.filter(c=>c.nome!=="Todos").map(c=>`
    <button class="category-card ${categoriaAtual===c.nome?"active":""}" data-category="${c.nome}">
      <div class="category-icon">${c.icone}</div><h3>${c.nome}</h3><p>${c.descricao}</p>
    </button>`).join("");
  document.querySelectorAll(".category-card").forEach(el=>{
    el.addEventListener("click",()=>{categoriaAtual=el.dataset.category; renderFilters(); renderCategorias(); renderProdutos(); document.querySelector("#catalogo").scrollIntoView({behavior:"smooth"});});
  });
}
function renderFilters(){
  filterRow.innerHTML = categorias.map(c=>`<button class="filter ${categoriaAtual===c.nome?"active":""}" data-filter="${c.nome}">${c.icone} ${c.nome}</button>`).join("");
  document.querySelectorAll(".filter").forEach(el=>el.addEventListener("click",()=>{categoriaAtual=el.dataset.filter;renderFilters();renderCategorias();renderProdutos();}));
}
function formatarPreco(preco){
  if(typeof preco==="number"&&Number.isFinite(preco))return preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  return preco||"Consulte o valor";
}
function renderProdutos(){
  const termo=(searchInput.value||"").toLowerCase().trim();
  const lista=produtos.filter(p=>(categoriaAtual==="Todos"||p.categoria===categoriaAtual)&&(!termo||`${p.nome} ${p.categoria||""} ${p.descricao}`.toLowerCase().includes(termo)));
  const cardProduto=p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <div class="product-placeholder" style="display:none">${p.icone}<small>Lúmina PERSONALIZA</small></div>
      </div>
      <div class="product-body">
        ${p.categoria?`<span class="product-category">${p.categoria}</span>`:""}
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <div class="product-footer"><span class="product-price">${formatarPreco(p.preco)}</span><button data-product="${p.id}">Ver detalhes →</button></div>
      </div>
    </article>`;
  const tamanhoLinha=6;
  const quantidadeLinhas=Math.ceil(lista.length/tamanhoLinha);
  const linhas=Array.from({length:quantidadeLinhas},(_,index)=>lista.slice(index*tamanhoLinha,(index+1)*tamanhoLinha));
  productRows.innerHTML=linhas.map((linha,index)=>`
    <div class="product-carousel" aria-label="Linha ${index+1} de produtos">
      <button class="product-carousel-arrow product-carousel-prev" type="button" aria-label="Ver produtos anteriores na linha ${index+1}" disabled>‹</button>
      <div class="product-grid" data-product-row="${index}">${linha.map(cardProduto).join("")}</div>
      <button class="product-carousel-arrow product-carousel-next" type="button" aria-label="Ver próximos produtos na linha ${index+1}" disabled>›</button>
    </div>`).join("");
  requestAnimationFrame(atualizarSetasProdutos);
  emptyState.hidden=lista.length!==0;
  productRows.querySelectorAll("[data-product]").forEach(btn=>btn.addEventListener("click",()=>abrirProduto(Number(btn.dataset.product))));
}
function atualizarSetasProdutos(){
  productRows.querySelectorAll(".product-carousel").forEach(carousel=>{
    const row=carousel.querySelector(".product-grid");
    const maxScroll=row.scrollWidth-row.clientWidth;
    carousel.querySelector(".product-carousel-prev").disabled=row.scrollLeft<=1;
    carousel.querySelector(".product-carousel-next").disabled=row.scrollLeft>=maxScroll-1;
    carousel.classList.toggle("has-overflow",maxScroll>1);
  });
}
productRows.addEventListener("click",event=>{
  const button=event.target.closest(".product-carousel-arrow");
  if(!button)return;
  const row=button.closest(".product-carousel").querySelector(".product-grid");
  row.scrollBy({left:(button.classList.contains("product-carousel-next")?1:-1)*row.clientWidth,behavior:"smooth"});
});
productRows.addEventListener("scroll",atualizarSetasProdutos,{passive:true,capture:true});
window.addEventListener("resize",atualizarSetasProdutos);
function abrirProduto(id){
  const p=produtos.find(x=>x.id===id); if(!p)return;
  const modal=document.querySelector("#productModal");
  const img=document.querySelector("#modalImage");
  img.innerHTML=`<img src="${p.imagem}" alt="${p.nome}" onerror="this.outerHTML='<div class=\\'product-placeholder\\' style=\\'display:block\\'>${p.icone}<small>Lúmina PERSONALIZA</small></div>'">`;
  document.querySelector("#modalCategory").textContent=p.categoria;
  document.querySelector("#modalTitle").textContent=p.nome;
  document.querySelector("#modalPrice").textContent=formatarPreco(p.preco);
  document.querySelector("#modalDescription").textContent=p.descricao;
  document.querySelector("#modalFeatures").innerHTML=p.recursos.map(x=>`<li>${x}</li>`).join("");
  document.querySelector("#modalWhatsapp").href=whatsappUrl(`Olá, Lúmina Personaliza! Quero fazer um pedido para: ${p.nome}.`);
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}
function fecharModal(){const m=document.querySelector("#productModal");m.classList.remove("open");m.setAttribute("aria-hidden","true");document.body.style.overflow="";}
document.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",fecharModal));
document.addEventListener("keydown",e=>{if(e.key==="Escape")fecharModal()});
searchInput.addEventListener("input",renderProdutos);
document.querySelectorAll("[data-whatsapp-general]").forEach(el=>el.href=whatsappUrl("Olá 👋! Tem algo especial em mente? A Lúmina está aqui para ajudar a dar vida à sua ideia. ✨"));
document.querySelector("#year").textContent=new Date().getFullYear();

const menuToggle=document.querySelector(".menu-toggle"), nav=document.querySelector(".nav");
menuToggle.addEventListener("click",()=>nav.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
document.querySelector(".nav-cta").addEventListener("click",()=>nav.classList.remove("open"));

renderCategorias(); renderFilters(); renderProdutos();

// Formulário de orçamento: gera uma mensagem estruturada para o WhatsApp já configurado.
const quoteForm=document.querySelector("#quoteForm");
if(quoteForm){
  const quotePhone=document.querySelector("#quotePhone");
  const quoteDeadline=document.querySelector("#quoteDeadline");
  const quoteDateField=document.querySelector("#quoteDateField");
  const quoteDate=document.querySelector("#quoteDate");
  const quoteAddressToggle=document.querySelector("#quoteAddressToggle");
  const quoteAddressFields=document.querySelector("#quoteAddressFields");
  quoteAddressToggle.addEventListener("click",()=>{
    const expanded=quoteAddressToggle.getAttribute("aria-expanded")==="true";
    quoteAddressToggle.setAttribute("aria-expanded",String(!expanded));
    quoteAddressFields.hidden=expanded;
    quoteAddressToggle.textContent=expanded?"＋ Informar endereço":"− Ocultar endereço";
  });
  quotePhone.addEventListener("input",()=>{
    const digits=quotePhone.value.replace(/\D/g,"").slice(0,11);
    quotePhone.value=digits.length>10?digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,"($1) $2-$3"):digits.length>6?digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,"($1) $2-$3"):digits.length>2?digits.replace(/^(\d{2})(\d{0,4})/,"($1) $2"):digits.length?"("+digits:"";
  });
  quoteDeadline.addEventListener("change",()=>{
    const visible=quoteDeadline.value==="data-especifica";
    quoteDateField.hidden=!visible;
    quoteDate.required=visible;
  });
  quoteForm.addEventListener("submit",event=>{
    event.preventDefault();
    if(!quoteForm.reportValidity())return;
    const data=new FormData(quoteForm);
    const value=key=>String(data.get(key)||"").trim();
    const phoneDigits=value("telefone").replace(/\D/g,"");
    if(phoneDigits.length<10||phoneDigits.length>11){quotePhone.setCustomValidity("Informe um telefone brasileiro com DDD.");quotePhone.reportValidity();quotePhone.setCustomValidity("");return;}
    const lines=["\u{2728} *NOVA SOLICITAÇÃO DE ORÇAMENTO — LÚMINA*","","\u{1F464} *Cliente:*",value("nome"),"\u{1F4F1} *WhatsApp:*",value("telefone"),"","━━━━━━━━━━━━━━━━━━","","\u{1F3AF} *OBJETIVO*",value("objetivo")];
    const addItem=(label,text)=>{if(text)lines.push("",label,text);};
    addItem("\u{1FAB5} *MATERIAL*",value("material"));
    addItem("\u{1F4E6} *QUANTIDADE*",value("quantidade"));
    addItem("\u{1F4D0} *TAMANHO*",value("tamanho"));
    const prazo=quoteDeadline.value==="data-especifica"?(value("dataEspecifica")?"Tenho uma data específica — "+new Date(value("dataEspecifica")+"T12:00:00").toLocaleDateString("pt-BR"):""):value("prazo");
    addItem("\u{1F4C5} *PRAZO*",prazo);
    addItem("\u{1F3A8} *ARTE / LOGOTIPO*",value("arte"));
    addItem("\u{1F4A1} *O QUE O CLIENTE DESEJA*",value("descricao"));
    addItem("\u{1F516} *REFERÊNCIA*",value("referencia"));
    const address=[["CEP","cep"],["Rua/Avenida","rua"],["Número","numero"],["Complemento","complemento"],["Bairro","bairro"],["Cidade","cidade"],["Estado","estado"]].filter(([,key])=>value(key)).map(([label,key])=>label+": "+value(key));
    if(address.length)lines.push("","━━━━━━━━━━━━━━━━━━","","\u{1F4CD} *ENDEREÇO PARA ENTREGA*","",...address);
    addItem("\u{1F4DD} *OBSERVAÇÕES*",value("observacoes"));
    lines.push("","━━━━━━━━━━━━━━━━━━","","\u{2728} Solicitação enviada pelo site da LÚMINA — Personalizados a Laser.");
    window.open(whatsappUrl(lines.join("\n")),"_blank","noopener,noreferrer");
  });
}
