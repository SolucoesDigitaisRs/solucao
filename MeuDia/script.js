// ════════════════════════════════════════════════════════════════════
// INDEXEDDB
// ════════════════════════════════════════════════════════════════════
const IDB = {
  db: null,
  STORES: ['pagar','receber','tarefas','eventos','notas'],

  open() {
    return new Promise((res, rej) => {
      const req = indexedDB.open('MeuDia_v1', 2);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        this.STORES.forEach(s => {
          if (!db.objectStoreNames.contains(s))
            db.createObjectStore(s, { keyPath:'id' });
        });
      };
      req.onsuccess  = e => { this.db = e.target.result; res(); };
      req.onerror    = () => rej(req.error);
      req.onblocked  = () => rej(new Error('IDB blocked'));
    });
  },

  getAll(store) {
    return new Promise((res, rej) => {
      const req = this.db.transaction(store,'readonly').objectStore(store).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror   = () => rej(req.error);
    });
  },

  putAll(store, items) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(store,'readwrite');
      const os = tx.objectStore(store);
      os.clear();
      items.forEach(item => os.put(item));
      tx.oncomplete = res;
      tx.onerror    = () => rej(tx.error);
    });
  },

  clearAll() {
    return Promise.all(
      this.STORES.map(s => new Promise((res, rej) => {
        const tx = this.db.transaction(s,'readwrite');
        tx.objectStore(s).clear();
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      }))
    );
  }
};

// ════════════════════════════════════════════════════════════════════
// IN-MEMORY DATA
// ════════════════════════════════════════════════════════════════════
let pagar=[], receber=[], tarefas=[], eventos=[], notas=[];

async function save() {
  try {
    await Promise.all([
      IDB.putAll('pagar',   pagar),
      IDB.putAll('receber', receber),
      IDB.putAll('tarefas', tarefas),
      IDB.putAll('eventos', eventos),
      IDB.putAll('notas',   notas),
    ]);
  } catch(e) {
    console.error('Erro ao salvar:', e);
    toast('Erro ao salvar dados!','err');
  }
}

// ════════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════════
const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt   = v  => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const fmtD  = d  => { if(!d) return '—'; const [y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; };
// Retorna 'YYYY-MM-DD' no fuso de Brasília (UTC-3), nunca em UTC
const today = () => {
  const d = new Date();
  // Offset de Brasília: UTC-3 (sem horário de verão desde 2019)
  const brt = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return brt.toISOString().slice(0, 10);
};
function diffDays(ds) {
  const n=new Date(); n.setHours(0,0,0,0);
  return Math.round((new Date(ds+'T00:00:00')-n)/86400000);
}
function statusPagar(ds,paid)   { if(paid) return'pago';     const d=diffDays(ds); return d<0?'vencido':d===0?'hoje':'pendente'; }
function statusReceber(ds,rec)  { if(rec)  return'recebido'; const d=diffDays(ds); return d<0?'vencido':d===0?'hoje':'pendente'; }

const ICONS={
  'Moradia':'🏠','Alimentação':'🍔','Transporte':'🚗','Saúde':'💊','Educação':'📚',
  'Lazer':'🎮','Utilities':'⚡','Outros':'📦','Salário':'💼','Freelance':'💻',
  'Investimentos':'📈','Aluguel':'🏠','Vendas':'🛒','Pessoal':'👤','Trabalho':'💼',
  'Finanças':'💰','Compras':'🛒',
};

// ════════════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════════════
let currentPage = 'dashboard';
let selectedNoteColor = 'gold';

const PAGE_TITLES = {
  dashboard:'Dashboard', pagar:'Contas a Pagar', receber:'Contas a Receber',
  tarefas:'Tarefas', agenda:'Agenda', notas:'Anotações', backup:'Backup & Restauração',
  sobre:'Sobre o App', termos:'Termos de Uso', privacidade:'Política de Privacidade',
};
const BTN_LABELS = {
  dashboard:'Adicionar', pagar:'Nova Conta', receber:'Nova Receita',
  tarefas:'Nova Tarefa', agenda:'Novo Evento', notas:'Nova Nota',
  backup:null, sobre:null, termos:null, privacidade:null,
};

// Bind all nav items (sidebar + drawer + mobile nav)
function bindNavItems() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => goTo(el.dataset.page));
  });
}

function goTo(page) {
  currentPage = page;
  // update all nav groups
  document.querySelectorAll('[data-page]').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page)
  );
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;
  const lbl = BTN_LABELS[page];
  document.getElementById('btn-add').style.display = lbl ? 'flex' : 'none';
  if(lbl) document.getElementById('btn-add-label').textContent = lbl;
  closeDrawer();
  render();
}

// ════════════════════════════════════════════════════════════════════
// DRAWER (mobile)
// ════════════════════════════════════════════════════════════════════
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').style.display='block';
  setTimeout(()=>document.getElementById('drawer-overlay').classList.add('open'),10);
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  const ov=document.getElementById('drawer-overlay');
  ov.classList.remove('open');
  setTimeout(()=>ov.style.display='none',260);
}

// ════════════════════════════════════════════════════════════════════
// RENDER
// ════════════════════════════════════════════════════════════════════
function render() {
  updateBadges();
  updateSidebarDate();
  const body = document.getElementById('page-body');
  body.scrollTop = 0;
  switch(currentPage) {
    case 'dashboard': body.innerHTML = renderDashboard(); break;
    case 'pagar':     body.innerHTML = renderPagar();     break;
    case 'receber':   body.innerHTML = renderReceber();   break;
    case 'tarefas':   body.innerHTML = renderTarefas();   break;
    case 'agenda':    body.innerHTML = renderAgenda(); initCalendar(); break;
    case 'notas':     body.innerHTML = renderNotas();     break;
    case 'backup':    body.innerHTML = renderBackup();    break;
    case 'sobre':     body.innerHTML = renderSobre();     break;
    case 'termos':    body.innerHTML = renderTermos();    break;
    case 'privacidade':body.innerHTML = renderPrivacidade();break;
  }
}

function updateBadges() {
  const bp = pagar.filter(p=>!p.pago&&['vencido','hoje'].includes(statusPagar(p.data,false))).length;
  const br = receber.filter(r=>!r.recebido).length;
  const bt = tarefas.filter(t=>!t.feita).length;

  const sb = (id,n,cls='')=>{
    const el=document.getElementById(id); if(!el) return;
    el.style.display = n>0?'flex':'none';
    el.textContent = n;
    if(cls) el.className='nav-badge '+cls;
  };
  sb('badge-pagar',bp); sb('badge-receber',br,'green'); sb('badge-tarefas',bt);

  const mb = (id,n,cls='')=>{
    const el=document.getElementById(id); if(!el) return;
    el.style.display = n>0?'flex':'none';
    el.textContent = n;
    if(cls) el.className='mob-badge '+cls;
  };
  mb('mbadge-pagar',bp); mb('mbadge-receber',br,'green'); mb('mbadge-tarefas',bt);
}

function updateSidebarDate() {
  const n=new Date();
  const dd=String(n.getDate()).padStart(2,'0');
  const dateStr=n.toLocaleDateString('pt-BR',{weekday:'short',month:'short',year:'numeric'});
  ['sidebar-day','drawer-day'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=dd;});
  ['sidebar-date','drawer-date'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=dateStr;});
}

// ════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════
function renderDashboard() {
  const n=new Date();
  const wd=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const ms=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const dateStr=`${wd[n.getDay()]}, ${n.getDate()} de ${ms[n.getMonth()]}`;

  const vencidas   = pagar.filter(p=>!p.pago&&diffDays(p.data)<0);
  const venceHoje  = pagar.filter(p=>!p.pago&&diffDays(p.data)===0);
  const vence3     = pagar.filter(p=>!p.pago&&diffDays(p.data)>0&&diffDays(p.data)<=3);
  const evHoje     = eventos.filter(e=>e.data===today());

  let alerts='';
  if(vencidas.length)  alerts+=`<div class="alert-strip danger">🚨 <strong>${vencidas.length} conta(s) vencida(s)</strong> — ação imediata!</div>`;
  if(venceHoje.length) alerts+=`<div class="alert-strip warn">⏰ <strong>Vence hoje:</strong> ${venceHoje.map(p=>p.desc).join(', ')}</div>`;
  if(vence3.length)    alerts+=`<div class="alert-strip warn">📅 ${vence3.length} conta(s) vencem em até 3 dias</div>`;
  if(evHoje.length)    alerts+=`<div class="alert-strip info">📆 <strong>Hoje:</strong> ${evHoje.map(e=>e.titulo+(e.hora?' às '+e.hora:'')).join(' · ')}</div>`;

  const totalPagar   = pagar.filter(p=>!p.pago).reduce((s,p)=>s+Number(p.valor),0);
  const totalReceber = receber.filter(r=>!r.recebido).reduce((s,r)=>s+Number(r.valor),0);
  const saldo = totalReceber - totalPagar;
  const feitas = tarefas.filter(t=>t.feita).length;
  const pct = tarefas.length ? Math.round(feitas/tarefas.length*100) : 0;

  const proxContas = [...pagar].filter(p=>!p.pago&&diffDays(p.data)>=0)
    .sort((a,b)=>a.data.localeCompare(b.data)).slice(0,4);
  const proxEventos = [...eventos].filter(e=>e.data>=today())
    .sort((a,b)=>a.data.localeCompare(b.data)||(a.hora||'').localeCompare(b.hora||'')).slice(0,3);

  const bannerHTML = '<a href="https://www.magazinevoce.com.br/magazineecvendas/" target="_blank" rel="noopener" class="magalu-banner">'
    + '<div class="magalu-glow"></div>'
    + '<div class="magalu-inner">'
    + '<div class="magalu-logo-wrap">&#128722;</div>'
    + '<div class="magalu-text">'
    + '<div class="magalu-badge">&#11088; Influenciador Magalu</div>'
    + '<div class="magalu-title">Promo&ccedil;&otilde;es imperd&iacute;veis todos os dias</div>'
    + '<div class="magalu-sub">Acesse agora e aproveite os melhores pre&ccedil;os &mdash; eletr&ocirc;nicos, m&oacute;veis, moda e muito mais com frete r&aacute;pido!</div>'
    + '</div>'
    + '<div class="magalu-cta">'
    + '<div class="magalu-cta-btn">VER OFERTAS &#8594;</div>'
    + '<div class="magalu-cta-hint">Abre em nova aba</div>'
    + '</div>'
    + '</div>'
    + '<div class="magalu-strip"></div>'
    + '</a>';

  return bannerHTML + `
  <div class="dash-welcome">
    <div class="dash-hello">Olá, <strong>bem-vindo!</strong></div>
    <div class="dash-date">${dateStr}</div>
  </div>
  ${alerts?`<div class="dash-alerts">${alerts}</div>`:''}
  <div class="grid-4" style="margin-bottom:16px;">
    <div class="stat-pill"><div class="stat-pill-label">A Pagar</div><div class="stat-pill-value red">${fmt(totalPagar)}</div><div class="stat-pill-sub">${pagar.filter(p=>!p.pago).length} pendente(s)</div></div>
    <div class="stat-pill"><div class="stat-pill-label">A Receber</div><div class="stat-pill-value green">${fmt(totalReceber)}</div><div class="stat-pill-sub">${receber.filter(r=>!r.recebido).length} pendente(s)</div></div>
    <div class="stat-pill"><div class="stat-pill-label">Saldo</div><div class="stat-pill-value ${saldo>=0?'green':'red'}">${fmt(saldo)}</div><div class="stat-pill-sub">${saldo>=0?'✓ Positivo':'⚠ Negativo'}</div></div>
    <div class="stat-pill"><div class="stat-pill-label">Tarefas</div><div class="stat-pill-value gold">${tarefas.filter(t=>!t.feita).length}</div><div class="stat-pill-sub">pendente(s)<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">💸 Próximos Vencimentos</div>
      ${proxContas.length===0
        ? `<div class="empty-state" style="padding:24px 0;"><div class="empty-icon">✅</div><div class="empty-msg">Sem contas pendentes</div></div>`
        : proxContas.map(p=>{
            const s=statusPagar(p.data,p.pago); const d=diffDays(p.data);
            const dl=d===0?'Hoje':d===1?'Amanhã':`${d}d`;
            return`<div class="list-item">
              <div class="item-icon" style="background:var(--redsoft)">${ICONS[p.cat]||'📦'}</div>
              <div class="item-body"><div class="item-title">${p.desc}</div><div class="item-meta">${dl} · ${fmtD(p.data)}</div></div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;">
                <span class="item-value" style="color:var(--red)">${fmt(p.valor)}</span>
                <span class="badge ${s}">${s}</span>
              </div>
            </div>`;
          }).join('')}
      <button class="btn-secondary" style="width:100%;margin-top:10px;font-size:12px;" onclick="goTo('pagar')">Ver todas →</button>
    </div>
    <div class="card">
      <div class="card-title">📅 Próximos Eventos</div>
      ${proxEventos.length===0
        ? `<div class="empty-state" style="padding:24px 0;"><div class="empty-icon">📭</div><div class="empty-msg">Nenhum evento agendado</div></div>`
        : proxEventos.map(e=>{
            const d=diffDays(e.data); const dl=d===0?'Hoje':d===1?'Amanhã':fmtD(e.data);
            return`<div class="event-item"><div class="event-time">${e.hora||'—'}</div><div class="event-body"><div class="event-title">${e.titulo}</div><div class="event-desc">${dl}${e.local?' · '+e.local:''}</div></div></div>`;
          }).join('')}
      <button class="btn-secondary" style="width:100%;margin-top:10px;font-size:12px;" onclick="goTo('agenda')">Ver agenda →</button>
    </div>
  </div>
  ${tarefas.filter(t=>!t.feita&&t.prio==='alta').length?`
  <div class="card">
    <div class="card-title">🔴 Urgente</div>
    ${tarefas.filter(t=>!t.feita&&t.prio==='alta').slice(0,3).map(t=>renderTarefaItem(t)).join('')}
  </div>`:''}`;
}

// ════════════════════════════════════════════════════════════════════
// ESTADO DOS FILTROS
// ════════════════════════════════════════════════════════════════════
const FM = {
  // Mês inicial = mês atual
  pagar:   { busca:'', di: _firstOfMonth(), df: _lastOfMonth(), status:'todos', sort:'data', asc:true },
  receber: { busca:'', di: _firstOfMonth(), df: _lastOfMonth(), status:'todos', sort:'data', asc:true },
};

function _firstOfMonth() {
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
}
function _lastOfMonth() {
  const d=new Date(); const last=new Date(d.getFullYear(),d.getMonth()+1,0);
  return `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,'0')}-${String(last.getDate()).padStart(2,'0')}`;
}

function applyFilterPagar() {
  FM.pagar.busca  = document.getElementById('fp-busca')?.value.trim().toLowerCase() || '';
  FM.pagar.di     = document.getElementById('fp-di')?.value || '';
  FM.pagar.df     = document.getElementById('fp-df')?.value || '';
  FM.pagar.status = document.getElementById('fp-status')?.value || 'todos';
  document.getElementById('page-body').innerHTML = renderPagar();
}
function clearFilterPagar() {
  FM.pagar = { busca:'', di:_firstOfMonth(), df:_lastOfMonth(), status:'todos', sort:FM.pagar.sort, asc:FM.pagar.asc };
  document.getElementById('page-body').innerHTML = renderPagar();
}
function sortPagar(col) {
  if(FM.pagar.sort===col) FM.pagar.asc=!FM.pagar.asc; else { FM.pagar.sort=col; FM.pagar.asc=true; }
  document.getElementById('page-body').innerHTML = renderPagar();
}

function applyFilterReceber() {
  FM.receber.busca  = document.getElementById('fr-busca')?.value.trim().toLowerCase() || '';
  FM.receber.di     = document.getElementById('fr-di')?.value || '';
  FM.receber.df     = document.getElementById('fr-df')?.value || '';
  FM.receber.status = document.getElementById('fr-status')?.value || 'todos';
  document.getElementById('page-body').innerHTML = renderReceber();
}
function clearFilterReceber() {
  FM.receber = { busca:'', di:_firstOfMonth(), df:_lastOfMonth(), status:'todos', sort:FM.receber.sort, asc:FM.receber.asc };
  document.getElementById('page-body').innerHTML = renderReceber();
}
function sortReceber(col) {
  if(FM.receber.sort===col) FM.receber.asc=!FM.receber.asc; else { FM.receber.sort=col; FM.receber.asc=true; }
  document.getElementById('page-body').innerHTML = renderReceber();
}

// ════════════════════════════════════════════════════════════════════
// PAGAR
// ════════════════════════════════════════════════════════════════════
function renderPagar() {
  const tp = pagar.filter(p=>!p.pago).reduce((s,p)=>s+Number(p.valor),0);
  const tg = pagar.filter(p=>p.pago).reduce((s,p)=>s+Number(p.valor),0);
  const tv = pagar.filter(p=>!p.pago&&diffDays(p.data)<0).length;

  const f = FM.pagar;
  let rows = pagar.filter(p => {
    if(f.busca && !p.desc.toLowerCase().includes(f.busca)) return false;
    if(f.di && p.data < f.di) return false;
    if(f.df && p.data > f.df) return false;
    if(f.status==='pendente' && p.pago) return false;
    if(f.status==='pago'     && !p.pago) return false;
    if(f.status==='vencido'  && (p.pago||diffDays(p.data)>=0)) return false;
    if(f.status==='hoje'     && (p.pago||diffDays(p.data)!==0)) return false;
    return true;
  });

  rows.sort((a,b)=>{
    let va,vb;
    if(f.sort==='desc')       { va=a.desc.toLowerCase(); vb=b.desc.toLowerCase(); }
    else if(f.sort==='valor') { va=Number(a.valor);      vb=Number(b.valor); }
    else if(f.sort==='cat')   { va=a.cat;                vb=b.cat; }
    else if(f.sort==='status'){ va=statusPagar(a.data,a.pago); vb=statusPagar(b.data,b.pago); }
    else                      { va=a.data;               vb=b.data; }
    if(va<vb) return f.asc?-1:1;
    if(va>vb) return f.asc?1:-1;
    return 0;
  });

  const totalFiltrado = rows.reduce((s,p)=>s+Number(p.valor),0);
  const hasFilter = f.busca||f.di||f.df||(f.status!=='todos');
  const sa = col => f.sort===col ? (f.asc?'&#8593;':'&#8595;') : '&#8597;';

  const statsHTML = '<div class="grid-3" style="margin-bottom:14px;">'
    + '<div class="stat-pill"><div class="stat-pill-label">Pendente</div><div class="stat-pill-value red">'+fmt(tp)+'</div><div class="stat-pill-sub">'+pagar.filter(p=>!p.pago).length+' conta(s)</div></div>'
    + '<div class="stat-pill"><div class="stat-pill-label">Pago</div><div class="stat-pill-value green">'+fmt(tg)+'</div><div class="stat-pill-sub">'+pagar.filter(p=>p.pago).length+' conta(s)</div></div>'
    + '<div class="stat-pill"><div class="stat-pill-label">Vencidas</div><div class="stat-pill-value red">'+tv+'</div><div class="stat-pill-sub">aten&ccedil;&atilde;o</div></div>'
    + '</div>';

  const filterHTML = '<div class="filter-bar">'
    + '<div class="filter-group" style="flex:2;min-width:180px;"><span class="filter-label">&#128269; Buscar descri&ccedil;&atilde;o</span>'
    + '<input class="filter-input" id="fp-busca" placeholder="Digite para filtrar..." value="'+f.busca+'" onkeydown="if(event.key===\'Enter\')applyFilterPagar()"/></div>'
    + '<div class="filter-group"><span class="filter-label">&#128197; Data in&iacute;cio</span>'
    + '<input class="filter-input" id="fp-di" type="date" value="'+f.di+'"/></div>'
    + '<div class="filter-group"><span class="filter-label">&#128197; Data fim</span>'
    + '<input class="filter-input" id="fp-df" type="date" value="'+f.df+'"/></div>'
    + '<div class="filter-group" style="min-width:130px;"><span class="filter-label">Status</span>'
    + '<select class="filter-input" id="fp-status">'
    + '<option value="todos"'+(f.status==='todos'?' selected':'')+'>Todos</option>'
    + '<option value="pendente"'+(f.status==='pendente'?' selected':'')+'>Pendente</option>'
    + '<option value="pago"'+(f.status==='pago'?' selected':'')+'>Pago</option>'
    + '<option value="vencido"'+(f.status==='vencido'?' selected':'')+'>Vencido</option>'
    + '<option value="hoje"'+(f.status==='hoje'?' selected':'')+'>Vence hoje</option>'
    + '</select></div>'
    + '<div class="filter-actions">'
    + '<button class="filter-btn apply" onclick="applyFilterPagar()">Filtrar</button>'
    + '<button class="filter-btn clear" onclick="clearFilterPagar()">Limpar</button>'
    + '</div></div>';

  const metaHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    + '<div class="filter-result"><strong>'+rows.length+'</strong> de '+pagar.length+' registro(s) '
    + (hasFilter?'<span class="filter-tag">&#10022; Filtro ativo</span>':'')+'</div>'
    + '<div style="font-size:12px;color:var(--muted);">Total filtrado: <strong style="color:var(--text);font-family:var(--font-d);">'+fmt(totalFiltrado)+'</strong></div>'
    + '</div>';

  if(rows.length===0) {
    return statsHTML + filterHTML + metaHTML
      + '<div class="empty-state card"><div class="empty-icon">&#128269;</div><div class="empty-msg">Nenhuma conta encontrada com os filtros aplicados.</div></div>';
  }

  const theadHTML = '<thead><tr>'
    + '<th class="td-icon"></th>'
    + '<th class="'+(f.sort==='desc'?'sorted':'')+'" onclick="sortPagar(\'desc\')">Descri&ccedil;&atilde;o <span class="sort-arrow">'+sa('desc')+'</span></th>'
    + '<th class="'+(f.sort==='cat'?'sorted':'')+'" onclick="sortPagar(\'cat\')">Categoria <span class="sort-arrow">'+sa('cat')+'</span></th>'
    + '<th class="'+(f.sort==='data'?'sorted':'')+'" onclick="sortPagar(\'data\')">Vencimento <span class="sort-arrow">'+sa('data')+'</span></th>'
    + '<th class="'+(f.sort==='status'?'sorted':'')+'" onclick="sortPagar(\'status\')">Status <span class="sort-arrow">'+sa('status')+'</span></th>'
    + '<th class="'+(f.sort==='valor'?'sorted':'')+'" onclick="sortPagar(\'valor\')" style="text-align:right">Valor <span class="sort-arrow">'+sa('valor')+'</span></th>'
    + '<th style="text-align:right">A&ccedil;&otilde;es</th>'
    + '</tr></thead>';

  const tbodyHTML = '<tbody>' + rows.map(p => {
    const s = statusPagar(p.data, p.pago);
    const d = diffDays(p.data);
    const dLabel = p.pago ? '' : d===0 ? ' &mdash; Hoje' : d===1 ? ' &mdash; Amanh&atilde;' : d<0 ? ' &mdash; '+Math.abs(d)+'d atr&aacute;s' : '';
    const dateColor = s==='vencido'?'var(--red)':s==='hoje'?'var(--gold)':'var(--sub)';
    const obs = p.obs ? '<br><span style="font-size:11px;color:var(--muted);font-weight:400;">'+p.obs+'</span>' : '';
    return '<tr class="'+(p.pago?'row-done':'')+'">'
      + '<td class="td-icon"><span style="background:'+(p.pago?'var(--greensoft)':'var(--redsoft)')+'">'+(ICONS[p.cat]||'&#128230;')+'</span></td>'
      + '<td class="td-desc" title="'+p.desc+'">'+p.desc+obs+'</td>'
      + '<td style="color:var(--sub);">'+p.cat+'</td>'
      + '<td style="color:'+dateColor+'">'+fmtD(p.data)+dLabel+'</td>'
      + '<td><span class="badge '+s+'">'+s+'</span></td>'
      + '<td class="td-valor" style="color:'+(p.pago?'var(--green)':'var(--red)')+'">'+fmt(p.valor)+'</td>'
      + '<td class="td-acoes">'
      + '<button class="act-btn check" onclick="togglePago(\''+p.id+'\')" title="'+(p.pago?'Desmarcar':'Marcar pago')+'">'+(p.pago?'&#8617;':'&#10003;')+'</button> '
      + '<button class="act-btn edit" onclick="editPagar(\''+p.id+'\')" title="Editar">&#9999;</button> '
      + '<button class="act-btn del" onclick="deletePagar(\''+p.id+'\')" title="Excluir">&#128465;</button>'
      + '</td></tr>';
  }).join('') + '</tbody>';

  const tableHTML = '<div class="table-wrap"><div class="table-scroll">'
    + '<table class="data-table">' + theadHTML + tbodyHTML + '</table>'
    + '</div><div class="table-footer">'
    + '<span class="table-footer-label">'+rows.length+' registro(s) exibido(s)</span>'
    + '<div><span style="font-size:11px;color:var(--muted);margin-right:8px;">Total:</span>'
    + '<span class="table-footer-value" style="color:var(--red)">'+fmt(totalFiltrado)+'</span></div>'
    + '</div></div>';

  return statsHTML + filterHTML + metaHTML + tableHTML;
}

function renderReceber() {
  const tp = receber.filter(r=>!r.recebido).reduce((s,r)=>s+Number(r.valor),0);
  const tr = receber.filter(r=>r.recebido).reduce((s,r)=>s+Number(r.valor),0);

  const f = FM.receber;
  let rows = receber.filter(r => {
    if(f.busca && !r.desc.toLowerCase().includes(f.busca)) return false;
    if(f.di && r.data < f.di) return false;
    if(f.df && r.data > f.df) return false;
    if(f.status==='pendente'  && r.recebido) return false;
    if(f.status==='recebido'  && !r.recebido) return false;
    if(f.status==='vencido'   && (r.recebido||diffDays(r.data)>=0)) return false;
    if(f.status==='hoje'      && (r.recebido||diffDays(r.data)!==0)) return false;
    return true;
  });

  rows.sort((a,b)=>{
    let va,vb;
    if(f.sort==='desc')       { va=a.desc.toLowerCase(); vb=b.desc.toLowerCase(); }
    else if(f.sort==='valor') { va=Number(a.valor);      vb=Number(b.valor); }
    else if(f.sort==='cat')   { va=a.cat;                vb=b.cat; }
    else if(f.sort==='status'){ va=statusReceber(a.data,a.recebido); vb=statusReceber(b.data,b.recebido); }
    else                      { va=a.data;               vb=b.data; }
    if(va<vb) return f.asc?-1:1;
    if(va>vb) return f.asc?1:-1;
    return 0;
  });

  const totalFiltrado = rows.reduce((s,r)=>s+Number(r.valor),0);
  const hasFilter = f.busca||f.di||f.df||(f.status!=='todos');
  const sa = col => f.sort===col ? (f.asc?'&#8593;':'&#8595;') : '&#8597;';

  const statsHTML = '<div class="grid-3" style="margin-bottom:14px;">'
    + '<div class="stat-pill"><div class="stat-pill-label">A Receber</div><div class="stat-pill-value green">'+fmt(tp)+'</div><div class="stat-pill-sub">'+receber.filter(r=>!r.recebido).length+' pendente(s)</div></div>'
    + '<div class="stat-pill"><div class="stat-pill-label">Recebido</div><div class="stat-pill-value gold">'+fmt(tr)+'</div><div class="stat-pill-sub">'+receber.filter(r=>r.recebido).length+' item(s)</div></div>'
    + '<div class="stat-pill"><div class="stat-pill-label">Total</div><div class="stat-pill-value blue">'+fmt(tp+tr)+'</div><div class="stat-pill-sub">'+receber.length+' registro(s)</div></div>'
    + '</div>';

  const filterHTML = '<div class="filter-bar">'
    + '<div class="filter-group" style="flex:2;min-width:180px;"><span class="filter-label">&#128269; Buscar descri&ccedil;&atilde;o</span>'
    + '<input class="filter-input" id="fr-busca" placeholder="Digite para filtrar..." value="'+f.busca+'" onkeydown="if(event.key===\'Enter\')applyFilterReceber()"/></div>'
    + '<div class="filter-group"><span class="filter-label">&#128197; Data in&iacute;cio</span>'
    + '<input class="filter-input" id="fr-di" type="date" value="'+f.di+'"/></div>'
    + '<div class="filter-group"><span class="filter-label">&#128197; Data fim</span>'
    + '<input class="filter-input" id="fr-df" type="date" value="'+f.df+'"/></div>'
    + '<div class="filter-group" style="min-width:130px;"><span class="filter-label">Status</span>'
    + '<select class="filter-input" id="fr-status">'
    + '<option value="todos"'+(f.status==='todos'?' selected':'')+'>Todos</option>'
    + '<option value="pendente"'+(f.status==='pendente'?' selected':'')+'>Pendente</option>'
    + '<option value="recebido"'+(f.status==='recebido'?' selected':'')+'>Recebido</option>'
    + '<option value="vencido"'+(f.status==='vencido'?' selected':'')+'>Atrasado</option>'
    + '<option value="hoje"'+(f.status==='hoje'?' selected':'')+'>Vence hoje</option>'
    + '</select></div>'
    + '<div class="filter-actions">'
    + '<button class="filter-btn apply" onclick="applyFilterReceber()">Filtrar</button>'
    + '<button class="filter-btn clear" onclick="clearFilterReceber()">Limpar</button>'
    + '</div></div>';

  const metaHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'
    + '<div class="filter-result"><strong>'+rows.length+'</strong> de '+receber.length+' registro(s) '
    + (hasFilter?'<span class="filter-tag">&#10022; Filtro ativo</span>':'')+'</div>'
    + '<div style="font-size:12px;color:var(--muted);">Total filtrado: <strong style="color:var(--text);font-family:var(--font-d);">'+fmt(totalFiltrado)+'</strong></div>'
    + '</div>';

  if(rows.length===0) {
    return statsHTML + filterHTML + metaHTML
      + '<div class="empty-state card"><div class="empty-icon">&#128269;</div><div class="empty-msg">Nenhuma receita encontrada com os filtros aplicados.</div></div>';
  }

  const theadHTML = '<thead><tr>'
    + '<th class="td-icon"></th>'
    + '<th class="'+(f.sort==='desc'?'sorted':'')+'" onclick="sortReceber(\'desc\')">Descri&ccedil;&atilde;o <span class="sort-arrow">'+sa('desc')+'</span></th>'
    + '<th class="'+(f.sort==='cat'?'sorted':'')+'" onclick="sortReceber(\'cat\')">Origem <span class="sort-arrow">'+sa('cat')+'</span></th>'
    + '<th class="'+(f.sort==='data'?'sorted':'')+'" onclick="sortReceber(\'data\')">Previs&atilde;o <span class="sort-arrow">'+sa('data')+'</span></th>'
    + '<th class="'+(f.sort==='status'?'sorted':'')+'" onclick="sortReceber(\'status\')">Status <span class="sort-arrow">'+sa('status')+'</span></th>'
    + '<th class="'+(f.sort==='valor'?'sorted':'')+'" onclick="sortReceber(\'valor\')" style="text-align:right">Valor <span class="sort-arrow">'+sa('valor')+'</span></th>'
    + '<th style="text-align:right">A&ccedil;&otilde;es</th>'
    + '</tr></thead>';

  const tbodyHTML = '<tbody>' + rows.map(r => {
    const s = statusReceber(r.data, r.recebido);
    const d = diffDays(r.data);
    const dLabel = r.recebido ? '' : d===0 ? ' &mdash; Hoje' : d===1 ? ' &mdash; Amanh&atilde;' : d<0 ? ' &mdash; '+Math.abs(d)+'d atr&aacute;s' : '';
    const dateColor = s==='vencido'?'var(--red)':s==='hoje'?'var(--gold)':'var(--sub)';
    const obs = r.obs ? '<br><span style="font-size:11px;color:var(--muted);font-weight:400;">'+r.obs+'</span>' : '';
    return '<tr class="'+(r.recebido?'row-done':'')+'">'
      + '<td class="td-icon"><span style="background:'+(r.recebido?'var(--greensoft)':'var(--goldsoft)')+'">'+(ICONS[r.cat]||'&#128176;')+'</span></td>'
      + '<td class="td-desc" title="'+r.desc+'">'+r.desc+obs+'</td>'
      + '<td style="color:var(--sub);">'+r.cat+'</td>'
      + '<td style="color:'+dateColor+'">'+fmtD(r.data)+dLabel+'</td>'
      + '<td><span class="badge '+s+'">'+s+'</span></td>'
      + '<td class="td-valor" style="color:'+(r.recebido?'var(--green)':'var(--gold)')+'">'+fmt(r.valor)+'</td>'
      + '<td class="td-acoes">'
      + '<button class="act-btn check" onclick="toggleRecebido(\''+r.id+'\')" title="'+(r.recebido?'Desmarcar':'Marcar recebido')+'">'+(r.recebido?'&#8617;':'&#10003;')+'</button> '
      + '<button class="act-btn edit" onclick="editReceber(\''+r.id+'\')" title="Editar">&#9999;</button> '
      + '<button class="act-btn del" onclick="deleteReceber(\''+r.id+'\')" title="Excluir">&#128465;</button>'
      + '</td></tr>';
  }).join('') + '</tbody>';

  const tableHTML = '<div class="table-wrap"><div class="table-scroll">'
    + '<table class="data-table">' + theadHTML + tbodyHTML + '</table>'
    + '</div><div class="table-footer">'
    + '<span class="table-footer-label">'+rows.length+' registro(s) exibido(s)</span>'
    + '<div><span style="font-size:11px;color:var(--muted);margin-right:8px;">Total:</span>'
    + '<span class="table-footer-value" style="color:var(--green)">'+fmt(totalFiltrado)+'</span></div>'
    + '</div></div>';

  return statsHTML + filterHTML + metaHTML + tableHTML;
}

function renderTarefaItem(t) {
  return`<div class="list-item ${t.feita?'done':''}">
    <div class="checkbox-wrap ${t.feita?'is-checked':''}" onclick="toggleTarefa('${t.id}')">
      <div class="custom-check">${t.feita?'✓':''}</div>
    </div>
    <div class="item-body"><div class="item-title">${t.titulo}</div><div class="item-meta">${t.cat}${t.data?' · '+fmtD(t.data):''}${t.obs?' · '+t.obs:''}</div></div>
    <span class="badge ${t.prio}">${t.prio}</span>
    <div class="item-actions" style="margin-left:6px">
      <button class="act-btn edit" onclick="editTarefa('${t.id}')" title="Editar">✏</button>
      <button class="act-btn del"  onclick="deleteTarefa('${t.id}')" title="Excluir">🗑</button>
    </div>
  </div>`;
}

function renderTarefas() {
  const feitas=tarefas.filter(t=>t.feita).length;
  const pct=tarefas.length?Math.round(feitas/tarefas.length*100):0;
  const groups=[
    {label:'🔴 Alta Prioridade', items:tarefas.filter(t=>!t.feita&&t.prio==='alta')},
    {label:'🟡 Média Prioridade', items:tarefas.filter(t=>!t.feita&&t.prio==='media')},
    {label:'🔵 Baixa Prioridade', items:tarefas.filter(t=>!t.feita&&t.prio==='baixa')},
    {label:'✅ Concluídas', items:tarefas.filter(t=>t.feita)},
  ];
  let html=`<div class="stat-pill" style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="stat-pill-label">Progresso</div><div class="stat-pill-value gold">${pct}%</div><div class="stat-pill-sub">${feitas} de ${tarefas.length} concluída(s)</div></div>
      <div style="font-size:40px;opacity:.12;">✓</div>
    </div>
    <div class="progress-bar" style="margin-top:12px;height:7px;"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>`;
  groups.forEach(g=>{
    if(!g.items.length) return;
    html+=`<div class="sec-header"><div class="sec-title">${g.label}</div><div class="sec-count">${g.items.length}</div></div>${g.items.map(t=>renderTarefaItem(t)).join('')}<div style="margin-bottom:18px;"></div>`;
  });
  if(!tarefas.length) html+=`<div class="empty-state card"><div class="empty-icon">✓</div><div class="empty-msg">Nenhuma tarefa. Clique em <strong>"Nova Tarefa"</strong>.</div></div>`;
  return html;
}

// ════════════════════════════════════════════════════════════════════
// AGENDA
// ════════════════════════════════════════════════════════════════════
let calDate=new Date(), selectedDate=today();

function renderAgenda() {
  return`<div class="agenda-layout"><div id="mini-cal-wrap"></div><div id="agenda-events-wrap"></div></div>`;
}
function initCalendar() { renderMiniCal(); renderEventsList(selectedDate); }

function renderMiniCal() {
  const y=calDate.getFullYear(), m=calDate.getMonth();
  const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const firstDay=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const daysInPrev=new Date(y,m,0).getDate();
  const todayStr=today();
  const eventDates=new Set(eventos.map(e=>e.data));
  let cells='';
  ['D','S','T','Q','Q','S','S'].forEach(d=>{cells+=`<div class="cal-dow">${d}</div>`;});
  for(let i=firstDay-1;i>=0;i--) cells+=`<div class="cal-day other-month">${daysInPrev-i}</div>`;
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells+=`<div class="cal-day${ds===todayStr?' today':''}${ds===selectedDate&&ds!==todayStr?' selected':''}${eventDates.has(ds)?' has-event':''}" onclick="selectDay('${ds}')">${d}</div>`;
  }
  const rem=(firstDay+daysInMonth)%7; if(rem) for(let d=1;d<=7-rem;d++) cells+=`<div class="cal-day other-month">${d}</div>`;
  document.getElementById('mini-cal-wrap').innerHTML=`<div class="mini-cal">
    <div class="cal-nav">
      <button class="cal-arrow" onclick="calPrev()">‹</button>
      <span class="cal-month">${months[m]} ${y}</span>
      <button class="cal-arrow" onclick="calNext()">›</button>
    </div>
    <div class="cal-grid">${cells}</div>
  </div>`;
}

function renderEventsList(ds) {
  const evs=eventos.filter(e=>e.data===ds).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));
  const [y,m,d]=ds.split('-');
  const labels=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const dl=labels[new Date(ds+'T00:00:00').getDay()];
  document.getElementById('agenda-events-wrap').innerHTML=`<div>
    <div class="sec-header"><div class="sec-title">${dl}, ${d}/${m}/${y}${ds===today()?' <span style="color:var(--gold);font-size:12px;">— Hoje</span>':''}</div><div class="sec-count">${evs.length}</div></div>
    ${evs.length===0
      ?`<div class="empty-state card"><div class="empty-icon">📭</div><div class="empty-msg">Nenhum evento neste dia.</div></div>`
      :evs.map(e=>`
      <div class="event-item">
        <div class="event-time">${e.hora||'—'}</div>
        <div class="event-body"><div class="event-title">${e.titulo}</div>${e.local?`<div class="event-desc">📍 ${e.local}</div>`:''}${e.desc?`<div class="event-desc">${e.desc}</div>`:''}</div>
        <div class="item-actions">
          <button class="act-btn edit" onclick="editEvento('${e.id}')">✏</button>
          <button class="act-btn del"  onclick="deleteEvento('${e.id}')">🗑</button>
        </div>
      </div>`).join('')}
  </div>`;
}

function selectDay(ds) { selectedDate=ds; renderMiniCal(); renderEventsList(ds); }
function calPrev()     { calDate.setMonth(calDate.getMonth()-1); renderMiniCal(); }
function calNext()     { calDate.setMonth(calDate.getMonth()+1); renderMiniCal(); }

// ════════════════════════════════════════════════════════════════════
// NOTAS
// ════════════════════════════════════════════════════════════════════
function renderNotas() {
  if(!notas.length) return`<div class="empty-state card" style="max-width:360px;"><div class="empty-icon">📝</div><div class="empty-msg">Nenhuma anotação.<br>Clique em <strong>"Nova Nota"</strong>.</div></div>`;
  return`<div class="sec-header"><div class="sec-title">Anotações</div><div class="sec-count">${notas.length}</div></div>
  <div class="notes-grid">${[...notas].sort((a,b)=>b.ts-a.ts).map(n=>`
    <div class="note-card color-${n.color}" onclick="editNota('${n.id}')">
      <div class="note-title">${n.titulo}</div>
      <div class="note-preview">${n.conteudo.replace(/</g,'&lt;')}</div>
      <div class="note-footer">
        <span class="note-date">${new Date(n.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}</span>
        <div class="note-actions" onclick="event.stopPropagation()">
          <button class="act-btn del" onclick="deleteNota('${n.id}')">🗑</button>
        </div>
      </div>
    </div>`).join('')}
  </div>`;
}

// ════════════════════════════════════════════════════════════════════
// BACKUP & RESTAURAÇÃO
// ════════════════════════════════════════════════════════════════════
function renderBackup() {
  const total = pagar.length+receber.length+tarefas.length+eventos.length+notas.length;
  const lastExport = localStorage.getItem('md_last_export');
  const lastImport = localStorage.getItem('md_last_import');
  return`
  <div class="card">
    <div class="card-title">📊 Dados no Dispositivo</div>
    <div class="backup-info-row"><span class="backup-info-label">Total de registros</span><span class="backup-info-val">${total}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Contas a Pagar</span><span class="backup-info-val">${pagar.length}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Contas a Receber</span><span class="backup-info-val">${receber.length}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Tarefas</span><span class="backup-info-val">${tarefas.length}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Eventos na Agenda</span><span class="backup-info-val">${eventos.length}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Anotações</span><span class="backup-info-val">${notas.length}</span></div>
    <div class="backup-info-row"><span class="backup-info-label">Armazenamento</span><span class="backup-info-val" style="color:var(--green)">IndexedDB</span></div>
    ${lastExport?`<div class="backup-info-row"><span class="backup-info-label">Último backup exportado</span><span class="backup-info-val">${new Date(lastExport).toLocaleString('pt-BR')}</span></div>`:''}
    ${lastImport?`<div class="backup-info-row"><span class="backup-info-label">Última restauração</span><span class="backup-info-val">${new Date(lastImport).toLocaleString('pt-BR')}</span></div>`:''}
  </div>

  <div class="card">
    <div class="card-title">📤 Exportar Backup</div>
    <p style="font-size:13px;color:var(--sub);margin-bottom:16px;line-height:1.6;">Salva todos os seus dados em um arquivo <strong>.json</strong> no dispositivo. Use para transferir dados entre navegadores ou como segurança.</p>
    <button class="btn-primary" onclick="doExport()" style="margin-bottom:10px;">⬇️ Baixar Backup Completo</button>
    <button class="btn-secondary" onclick="doExportCSV()" style="width:100%;">📊 Exportar Contas como CSV</button>
  </div>

  <div class="card">
    <div class="card-title">📥 Restaurar Backup</div>
    <p style="font-size:13px;color:var(--sub);margin-bottom:14px;line-height:1.6;">Selecione um arquivo <strong>.json</strong> gerado pelo MeuDia para restaurar seus dados.</p>
    <div class="drop-zone" id="drop-zone"
      onclick="document.getElementById('import-file').click()"
      ondragover="event.preventDefault();this.classList.add('drag-over')"
      ondragleave="this.classList.remove('drag-over')"
      ondrop="event.preventDefault();this.classList.remove('drag-over');handleDropImport(event)">
      <div class="drop-icon">📂</div>
      <div class="drop-label">Toque para selecionar arquivo</div>
      <div class="drop-hint">ou arraste um arquivo .json aqui</div>
    </div>
    <p style="font-size:11px;color:var(--muted);margin-top:10px;text-align:center;">⚠️ A restauração substitui todos os dados atuais.</p>
  </div>

  <div class="card" style="border-color:rgba(245,101,101,.2);">
    <div class="card-title" style="color:var(--red);">⚠️ Zona de Perigo</div>
    <div class="danger-box">
      <div class="danger-box-title">Apagar todos os dados</div>
      <div class="danger-box-desc">Esta ação remove permanentemente todas as contas, tarefas, eventos e anotações. Exporte um backup antes de prosseguir.</div>
      <button class="btn-danger" onclick="confirmarLimpeza()">🗑️ Apagar tudo permanentemente</button>
    </div>
  </div>`;
}

// ── EXPORT ─────────────────────────────────────────────────────────
function doExport() {
  const data = {
    _app:'MeuDia', _v:2,
    _at: new Date().toISOString(),
    pagar, receber, tarefas, eventos, notas,
  };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = Object.assign(document.createElement('a'),{
    href: URL.createObjectURL(blob),
    download:`meudia-backup-${today()}.json`,
  });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
  localStorage.setItem('md_last_export', new Date().toISOString());
  toast('Backup exportado com sucesso!','ok');
  render();
}

function doExportCSV() {
  const header='Data,Tipo,Descrição,Categoria,Valor,Status';
  const rowsP=pagar.map(p=>[p.data,'Pagar',`"${p.desc}"`,p.cat,Number(p.valor).toFixed(2),p.pago?'Pago':'Pendente'].join(','));
  const rowsR=receber.map(r=>[r.data,'Receber',`"${r.desc}"`,r.cat,Number(r.valor).toFixed(2),r.recebido?'Recebido':'Pendente'].join(','));
  const csv='\uFEFF'+[header,...rowsP,...rowsR].join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`meudia-contas-${today()}.csv`});
  document.body.appendChild(a); a.click(); a.remove();
  toast('CSV exportado!','ok');
}

// ── IMPORT ─────────────────────────────────────────────────────────
function handleDropImport(e) {
  const file=e.dataTransfer.files[0];
  if(file) processImportFile(file);
}

function handleImport(input) {
  const file=input.files[0];
  if(file) processImportFile(file);
  input.value='';
}

async function processImportFile(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if(!data._app && !data.pagar && !data.receber) throw new Error('Arquivo inválido');
    const dataStr = data._at ? new Date(data._at).toLocaleString('pt-BR') : 'data desconhecida';
    const totalReg = [data.pagar,data.receber,data.tarefas,data.eventos,data.notas].reduce((s,a)=>s+(Array.isArray(a)?a.length:0),0);
    showConfirm({
      icon:'📥', title:'Restaurar backup?',
      msg:`Backup de ${dataStr} com ${totalReg} registro(s).`,
      detail:'Todos os dados atuais serão substituídos. Esta ação não pode ser desfeita.',
      confirmText:'Restaurar', dangerous:false,
      onConfirm: async () => {
        pagar   = Array.isArray(data.pagar)   ? data.pagar   : [];
        receber = Array.isArray(data.receber) ? data.receber : [];
        tarefas = Array.isArray(data.tarefas) ? data.tarefas : [];
        eventos = Array.isArray(data.eventos) ? data.eventos : [];
        notas   = Array.isArray(data.notas)   ? data.notas   : [];
        await save();
        localStorage.setItem('md_last_import', new Date().toISOString());
        toast('Dados restaurados com sucesso!','ok');
        render();
      }
    });
    return; // execução continua dentro do callback acima
  } catch(err) {
    toast('Arquivo inválido ou corrompido!','err');
  }
}

function confirmarLimpeza() {
  showConfirm({
    icon:'🗑️', title:'Apagar tudo?',
    msg:'Todas as contas, tarefas, eventos e anotações serão removidas.',
    detail:'⚠️ Esta ação é permanente e não pode ser desfeita. Exporte um backup antes de continuar.',
    confirmText:'Apagar tudo', dangerous:true,
    onConfirm: async () => {
      pagar=[]; receber=[]; tarefas=[]; eventos=[]; notas=[];
      await IDB.clearAll();
      toast('Todos os dados foram apagados.','info');
      render();
    }
  });
}

// ════════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════════
let _confirmCallback = () => {};

function showConfirm({ icon='⚠️', title, msg, detail='', confirmText='Confirmar', dangerous=false, onConfirm }) {
  document.getElementById('confirm-icon').textContent = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const det = document.getElementById('confirm-detail');
  if(detail){ det.textContent = detail; det.style.display='block'; }
  else { det.style.display='none'; }
  const btn = document.getElementById('confirm-ok-btn');
  btn.textContent = confirmText;
  btn.className = 'btn-confirm-ok' + (dangerous?' danger':'');
  _confirmCallback = async () => {
    closeModal('modal-confirm');
    await onConfirm();
  };
  openModal('modal-confirm');
}

// ════════════════════════════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════════════════════════════
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m=>
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('open'); })
);

function resetF(...ids){ ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value=''; }); }
function selectColor(color,el){
  selectedNoteColor=color;
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('selected',d.dataset.color===color));
}

function openAddModal() {
  switch(currentPage) {
    case'pagar':
      resetF('pagar-edit-id','pagar-desc','pagar-valor','pagar-obs');
      document.getElementById('pagar-data').value=today();
      document.getElementById('pagar-status').value='pendente';
      document.getElementById('modal-pagar-title').textContent='Nova Conta a Pagar';
      openModal('modal-pagar'); break;
    case'receber':
      resetF('receber-edit-id','receber-desc','receber-valor','receber-obs');
      document.getElementById('receber-data').value=today();
      document.getElementById('receber-status').value='pendente';
      document.getElementById('modal-receber-title').textContent='Nova Conta a Receber';
      openModal('modal-receber'); break;
    case'tarefas':
      resetF('tarefa-edit-id','tarefa-titulo','tarefa-obs');
      document.getElementById('tarefa-data').value='';
      document.getElementById('tarefa-prio').value='media';
      document.getElementById('modal-tarefa-title').textContent='Nova Tarefa';
      openModal('modal-tarefa'); break;
    case'agenda':
      resetF('evento-edit-id','evento-titulo','evento-local','evento-desc');
      document.getElementById('evento-data').value=selectedDate;
      document.getElementById('evento-hora').value='';
      document.getElementById('modal-evento-title').textContent='Novo Evento';
      openModal('modal-evento'); break;
    case'notas':
      resetF('nota-edit-id','nota-titulo','nota-conteudo');
      selectedNoteColor='gold';
      document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('selected',d.dataset.color==='gold'));
      document.getElementById('modal-nota-title').textContent='Nova Anotação';
      openModal('modal-nota'); break;
    default:
      goTo('pagar'); setTimeout(openAddModal,80); break;
  }
}

// ════════════════════════════════════════════════════════════════════
// CRUD — PAGAR
// ════════════════════════════════════════════════════════════════════
async function savePagar() {
  const desc=document.getElementById('pagar-desc').value.trim();
  const valor=parseFloat(document.getElementById('pagar-valor').value);
  const data=document.getElementById('pagar-data').value;
  if(!desc||!valor||!data){ toast('Preencha os campos obrigatórios!','err'); return; }
  const eid=document.getElementById('pagar-edit-id').value;
  const item={id:eid||uid(),desc,valor,data,cat:document.getElementById('pagar-cat').value,pago:document.getElementById('pagar-status').value==='pago',obs:document.getElementById('pagar-obs').value.trim()};
  if(eid) pagar=pagar.map(p=>p.id===eid?item:p); else pagar.push(item);
  await save(); closeModal('modal-pagar'); render(); toast(eid?'Conta atualizada!':'Conta adicionada!','ok');
}
async function togglePago(id){ pagar=pagar.map(p=>p.id===id?{...p,pago:!p.pago}:p); await save(); render(); }
function editPagar(id){
  const p=pagar.find(p=>p.id===id); if(!p) return;
  ['pagar-edit-id','pagar-desc','pagar-valor','pagar-data','pagar-cat','pagar-obs'].forEach((f,i)=>{
    document.getElementById(f).value=[p.id,p.desc,p.valor,p.data,p.cat,p.obs||''][i];
  });
  document.getElementById('pagar-status').value=p.pago?'pago':'pendente';
  document.getElementById('modal-pagar-title').textContent='Editar Conta';
  openModal('modal-pagar');
}
async function deletePagar(id){
  showConfirm({icon:'💸',title:'Excluir conta?',msg:'Esta ação não pode ser desfeita.',confirmText:'Excluir',dangerous:true,
    onConfirm:async()=>{ pagar=pagar.filter(p=>p.id!==id); await save(); render(); toast('Conta removida','info'); }
  });
}

// ════════════════════════════════════════════════════════════════════
// CRUD — RECEBER
// ════════════════════════════════════════════════════════════════════
async function saveReceber() {
  const desc=document.getElementById('receber-desc').value.trim();
  const valor=parseFloat(document.getElementById('receber-valor').value);
  const data=document.getElementById('receber-data').value;
  if(!desc||!valor||!data){ toast('Preencha os campos obrigatórios!','err'); return; }
  const eid=document.getElementById('receber-edit-id').value;
  const item={id:eid||uid(),desc,valor,data,cat:document.getElementById('receber-cat').value,recebido:document.getElementById('receber-status').value==='recebido',obs:document.getElementById('receber-obs').value.trim()};
  if(eid) receber=receber.map(r=>r.id===eid?item:r); else receber.push(item);
  await save(); closeModal('modal-receber'); render(); toast(eid?'Receita atualizada!':'Receita adicionada!','ok');
}
async function toggleRecebido(id){ receber=receber.map(r=>r.id===id?{...r,recebido:!r.recebido}:r); await save(); render(); }
function editReceber(id){
  const r=receber.find(r=>r.id===id); if(!r) return;
  ['receber-edit-id','receber-desc','receber-valor','receber-data','receber-cat','receber-obs'].forEach((f,i)=>{
    document.getElementById(f).value=[r.id,r.desc,r.valor,r.data,r.cat,r.obs||''][i];
  });
  document.getElementById('receber-status').value=r.recebido?'recebido':'pendente';
  document.getElementById('modal-receber-title').textContent='Editar Receita';
  openModal('modal-receber');
}
async function deleteReceber(id){
  showConfirm({icon:'💰',title:'Excluir receita?',msg:'Esta ação não pode ser desfeita.',confirmText:'Excluir',dangerous:true,
    onConfirm:async()=>{ receber=receber.filter(r=>r.id!==id); await save(); render(); toast('Receita removida','info'); }
  });
}

// ════════════════════════════════════════════════════════════════════
// CRUD — TAREFAS
// ════════════════════════════════════════════════════════════════════
async function saveTarefa() {
  const titulo=document.getElementById('tarefa-titulo').value.trim();
  if(!titulo){ toast('Informe o título da tarefa!','err'); return; }
  const eid=document.getElementById('tarefa-edit-id').value;
  const ex=tarefas.find(t=>t.id===eid);
  const item={id:eid||uid(),titulo,prio:document.getElementById('tarefa-prio').value,cat:document.getElementById('tarefa-cat').value,data:document.getElementById('tarefa-data').value,obs:document.getElementById('tarefa-obs').value.trim(),feita:ex?.feita||false};
  if(eid) tarefas=tarefas.map(t=>t.id===eid?item:t); else tarefas.push(item);
  await save(); closeModal('modal-tarefa'); render(); toast(eid?'Tarefa atualizada!':'Tarefa adicionada!','ok');
}
async function toggleTarefa(id){ tarefas=tarefas.map(t=>t.id===id?{...t,feita:!t.feita}:t); await save(); render(); }
function editTarefa(id){
  const t=tarefas.find(t=>t.id===id); if(!t) return;
  document.getElementById('tarefa-edit-id').value=t.id;
  document.getElementById('tarefa-titulo').value=t.titulo;
  document.getElementById('tarefa-prio').value=t.prio;
  document.getElementById('tarefa-cat').value=t.cat;
  document.getElementById('tarefa-data').value=t.data||'';
  document.getElementById('tarefa-obs').value=t.obs||'';
  document.getElementById('modal-tarefa-title').textContent='Editar Tarefa';
  openModal('modal-tarefa');
}
async function deleteTarefa(id){
  showConfirm({icon:'✓',title:'Excluir tarefa?',msg:'Esta ação não pode ser desfeita.',confirmText:'Excluir',dangerous:true,
    onConfirm:async()=>{ tarefas=tarefas.filter(t=>t.id!==id); await save(); render(); toast('Tarefa removida','info'); }
  });
}

// ════════════════════════════════════════════════════════════════════
// CRUD — EVENTOS
// ════════════════════════════════════════════════════════════════════
async function saveEvento() {
  const titulo=document.getElementById('evento-titulo').value.trim();
  const data=document.getElementById('evento-data').value;
  if(!titulo||!data){ toast('Informe título e data!','err'); return; }
  const eid=document.getElementById('evento-edit-id').value;
  const item={id:eid||uid(),titulo,data,hora:document.getElementById('evento-hora').value,local:document.getElementById('evento-local').value.trim(),desc:document.getElementById('evento-desc').value.trim()};
  if(eid) eventos=eventos.map(e=>e.id===eid?item:e); else eventos.push(item);
  selectedDate=data; await save(); closeModal('modal-evento'); render(); toast(eid?'Evento atualizado!':'Evento adicionado!','ok');
}
function editEvento(id){
  const e=eventos.find(e=>e.id===id); if(!e) return;
  document.getElementById('evento-edit-id').value=e.id;
  document.getElementById('evento-titulo').value=e.titulo;
  document.getElementById('evento-data').value=e.data;
  document.getElementById('evento-hora').value=e.hora||'';
  document.getElementById('evento-local').value=e.local||'';
  document.getElementById('evento-desc').value=e.desc||'';
  document.getElementById('modal-evento-title').textContent='Editar Evento';
  openModal('modal-evento');
}
async function deleteEvento(id){
  showConfirm({icon:'📅',title:'Excluir evento?',msg:'Esta ação não pode ser desfeita.',confirmText:'Excluir',dangerous:true,
    onConfirm:async()=>{ eventos=eventos.filter(e=>e.id!==id); await save(); render(); toast('Evento removido','info'); }
  });
}

// ════════════════════════════════════════════════════════════════════
// CRUD — NOTAS
// ════════════════════════════════════════════════════════════════════
async function saveNota() {
  const titulo=document.getElementById('nota-titulo').value.trim();
  const conteudo=document.getElementById('nota-conteudo').value.trim();
  if(!titulo||!conteudo){ toast('Preencha título e conteúdo!','err'); return; }
  const eid=document.getElementById('nota-edit-id').value;
  const item={id:eid||uid(),titulo,conteudo,color:selectedNoteColor,ts:eid?(notas.find(n=>n.id===eid)?.ts||Date.now()):Date.now()};
  if(eid) notas=notas.map(n=>n.id===eid?item:n); else notas.push(item);
  await save(); closeModal('modal-nota'); render(); toast(eid?'Nota atualizada!':'Nota adicionada!','ok');
}
function editNota(id){
  const n=notas.find(n=>n.id===id); if(!n) return;
  document.getElementById('nota-edit-id').value=n.id;
  document.getElementById('nota-titulo').value=n.titulo;
  document.getElementById('nota-conteudo').value=n.conteudo;
  selectedNoteColor=n.color||'gold';
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('selected',d.dataset.color===selectedNoteColor));
  document.getElementById('modal-nota-title').textContent='Editar Anotação';
  openModal('modal-nota');
}
async function deleteNota(id){
  showConfirm({icon:'📝',title:'Excluir anotação?',msg:'Esta ação não pode ser desfeita.',confirmText:'Excluir',dangerous:true,
    onConfirm:async()=>{ notas=notas.filter(n=>n.id!==id); await save(); render(); toast('Nota removida','info'); }
  });
}

// ════════════════════════════════════════════════════════════════════
// SOBRE
// ════════════════════════════════════════════════════════════════════
function renderSobre() {
  return `<div class="info-page">
  <div class="info-hero">
    <div class="info-hero-icon">📋</div>
    <div>
      <div class="info-hero-title">MeuDia</div>
      <div class="info-hero-sub">Gestão pessoal do dia a dia · Versão 1.0.0<br>Aplicativo local · Sem cadastro · Sem servidor</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-section-title">🎯 O que é o MeuDia?</div>
    <div class="info-badge green">✓ 100% gratuito e offline</div>
    <p>O <strong>MeuDia</strong> é um aplicativo pessoal de organização financeira e do dia a dia, desenvolvido para funcionar completamente no seu navegador, sem necessidade de cadastro, login ou conexão com servidores externos.</p>
    <p>Todos os seus dados são armazenados localmente no seu dispositivo usando <strong>IndexedDB</strong>, uma tecnologia nativa dos navegadores modernos. Nenhuma informação é enviada para a internet.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">✨ Funcionalidades</div>
    <div class="feature-grid">
      <div class="feature-item"><div class="feature-item-icon">💸</div><div class="feature-item-body"><div class="feature-item-title">Contas a Pagar</div><div class="feature-item-desc">Controle vencimentos, categorias e status de pagamento</div></div></div>
      <div class="feature-item"><div class="feature-item-icon">💰</div><div class="feature-item-body"><div class="feature-item-title">Contas a Receber</div><div class="feature-item-desc">Acompanhe receitas previstas e já recebidas</div></div></div>
      <div class="feature-item"><div class="feature-item-icon">✓</div><div class="feature-item-body"><div class="feature-item-title">Tarefas</div><div class="feature-item-desc">Lista por prioridade com progresso visual</div></div></div>
      <div class="feature-item"><div class="feature-item-icon">📅</div><div class="feature-item-body"><div class="feature-item-title">Agenda</div><div class="feature-item-desc">Calendário mensal com gestão de eventos</div></div></div>
      <div class="feature-item"><div class="feature-item-icon">📝</div><div class="feature-item-body"><div class="feature-item-title">Anotações</div><div class="feature-item-desc">Notas coloridas para guardar qualquer informação</div></div></div>
      <div class="feature-item"><div class="feature-item-icon">🛡️</div><div class="feature-item-body"><div class="feature-item-title">Backup</div><div class="feature-item-desc">Exportação e restauração de dados em JSON e CSV</div></div></div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-section-title">🛠️ Tecnologia</div>
    <p>O aplicativo é um único arquivo <strong>HTML</strong> que pode ser salvo e aberto em qualquer navegador moderno (Chrome, Firefox, Safari, Edge). Utiliza:</p>
    <ul>
      <li><strong>IndexedDB</strong> para persistência robusta dos dados localmente</li>
      <li><strong>CSS3 + JavaScript puro</strong> sem dependências ou frameworks externos</li>
      <li>Fontes do <strong>Google Fonts</strong> (Fraunces + Outfit) — requer conexão apenas para carregá-las</li>
      <li>Design responsivo compatível com <strong>mobile e desktop</strong></li>
    </ul>
  </div>

  <div class="info-section">
    <div class="info-section-title">⚠️ Sobre os seus dados</div>
    <p>Por ser um aplicativo local, é <strong>sua responsabilidade</strong> realizar backups regulares dos seus dados. Utilize a seção <strong>Backup &amp; Restauração</strong> para exportar um arquivo <code>.json</code> periodicamente.</p>
    <p>Limpar os dados do navegador, desinstalar o app ou formatar o dispositivo pode resultar em <strong>perda permanente dos dados</strong>.</p>
  </div>
</div>`;
}

// ════════════════════════════════════════════════════════════════════
// TERMOS DE USO
// ════════════════════════════════════════════════════════════════════
function renderTermos() {
  return `<div class="info-page">
  <div class="info-hero">
    <div class="info-hero-icon">📄</div>
    <div>
      <div class="info-hero-title">Termos de Uso</div>
      <div class="info-hero-sub">Última atualização: Janeiro de 2025<br>Leia com atenção antes de usar o aplicativo</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-section-title">1. Aceitação dos Termos</div>
    <p>Ao acessar ou utilizar o <strong>MeuDia</strong>, você concorda integralmente com estes Termos de Uso. Se não concordar com qualquer disposição, interrompa imediatamente o uso do aplicativo.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">2. Natureza do Serviço</div>
    <p>O MeuDia é disponibilizado <strong>"no estado em que se encontra"</strong> (as-is), sem qualquer garantia expressa ou implícita de disponibilidade contínua, ausência de erros, adequação a fins específicos ou resultados financeiros.</p>
    <p>O aplicativo é uma ferramenta de organização pessoal e <strong>não substitui</strong> serviços de contabilidade, planejamento financeiro profissional, assessoria jurídica ou qualquer serviço especializado regulamentado.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">3. Responsabilidade pelo Uso</div>
    <p>O usuário é o único responsável pelo uso do aplicativo e pelas decisões tomadas com base nas informações nele inseridas. O desenvolvedor <strong>não se responsabiliza</strong> por:</p>
    <ul>
      <li>Decisões financeiras tomadas com base nos dados registrados no app</li>
      <li>Perda de dados decorrente de falha do navegador, dispositivo, ou remoção de dados locais</li>
      <li>Uso indevido ou acesso não autorizado ao dispositivo do usuário</li>
      <li>Danos diretos, indiretos, incidentais ou consequenciais de qualquer natureza</li>
      <li>Incompatibilidade com versões específicas de navegadores ou sistemas operacionais</li>
    </ul>
  </div>

  <div class="info-section">
    <div class="info-section-title">4. Armazenamento e Segurança dos Dados</div>
    <p>Todos os dados são armazenados <strong>exclusivamente no dispositivo do usuário</strong>. O desenvolvedor não tem acesso, não coleta e não processa quaisquer dados pessoais inseridos no aplicativo.</p>
    <p>A segurança dos dados armazenados no dispositivo é de <strong>responsabilidade exclusiva do usuário</strong>. Recomenda-se fortemente a realização de backups periódicos pela seção de Backup do aplicativo.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">5. Propriedade Intelectual</div>
    <p>O código-fonte, design, estrutura e conteúdo do MeuDia são propriedade do desenvolvedor e estão protegidos pela legislação aplicável. É vedada a reprodução, redistribuição ou venda sem autorização expressa.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">6. Modificações</div>
    <p>Estes termos podem ser atualizados a qualquer momento. O uso continuado do aplicativo após modificações implica na aceitação dos novos termos.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">7. Legislação Aplicável</div>
    <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão submetidas ao foro da comarca do desenvolvedor, renunciando-se a qualquer outro, por mais privilegiado que seja.</p>
    <div class="info-last-update">Versão 1.0 · Janeiro 2025</div>
  </div>
</div>`;
}

// ════════════════════════════════════════════════════════════════════
// POLÍTICA DE PRIVACIDADE
// ════════════════════════════════════════════════════════════════════
function renderPrivacidade() {
  return `<div class="info-page">
  <div class="info-hero">
    <div class="info-hero-icon">🔒</div>
    <div>
      <div class="info-hero-title">Política de Privacidade</div>
      <div class="info-hero-sub">Última atualização: Janeiro de 2025<br>Conformidade com a LGPD (Lei nº 13.709/2018)</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-section-title">1. Compromisso com sua Privacidade</div>
    <div class="info-badge blue">🔒 Zero coleta de dados</div>
    <p>O MeuDia foi desenvolvido com privacidade por padrão (<em>privacy by design</em>). <strong>Não coletamos, não armazenamos em servidores, não vendemos e não compartilhamos nenhum dado pessoal</strong> dos usuários.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">2. Quais dados o app utiliza?</div>
    <p>O aplicativo utiliza exclusivamente os dados que <strong>você mesmo inserir</strong>:</p>
    <ul>
      <li>Informações financeiras (contas, valores, datas)</li>
      <li>Tarefas e compromissos pessoais</li>
      <li>Eventos da agenda</li>
      <li>Anotações de texto livre</li>
    </ul>
    <p>Esses dados são processados e armazenados <strong>somente no seu dispositivo</strong>, através do IndexedDB do navegador. O desenvolvedor não tem acesso a nenhum desses dados.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">3. Armazenamento Local</div>
    <p>Todos os dados ficam salvos no <strong>IndexedDB</strong> e <strong>localStorage</strong> do navegador que você utiliza. Eles <strong>não saem do seu dispositivo</strong> — não há sincronização em nuvem, não há envio de dados para servidores externos.</p>
    <p>Você pode apagar todos os dados a qualquer momento pela seção <em>Backup &gt; Zona de Perigo</em>, ou limpando os dados de site do navegador nas configurações do sistema.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">4. Cookies e Rastreamento</div>
    <p>O MeuDia <strong>não utiliza cookies</strong> de rastreamento, pixels de marketing, ferramentas de analytics, SDKs de redes sociais ou qualquer tecnologia de monitoramento de comportamento do usuário.</p>
    <p>O único dado salvo fora do IndexedDB é a data dos últimos backup/restauração, gravado no localStorage apenas para exibição informativa na interface.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">5. Fontes externas (Google Fonts)</div>
    <p>O aplicativo carrega fontes do <strong>Google Fonts</strong> via CDN ao ser aberto online. Essa requisição está sujeita à <a href="https://policies.google.com/privacy" target="_blank">Política de Privacidade do Google</a>. Para uso completamente offline, o arquivo HTML pode ser adaptado com fontes locais.</p>
  </div>

  <div class="info-section">
    <div class="info-section-title">6. Seus Direitos (LGPD)</div>
    <p>Como todos os dados estão <strong>exclusivamente no seu dispositivo</strong>, você já possui controle total sobre eles. Você pode:</p>
    <ul>
      <li><strong>Acessar</strong> — todos os dados são visíveis dentro do próprio app</li>
      <li><strong>Exportar</strong> — via Backup &gt; Exportar Backup</li>
      <li><strong>Corrigir</strong> — editando qualquer registro diretamente no app</li>
      <li><strong>Apagar</strong> — via Backup &gt; Zona de Perigo</li>
      <li><strong>Portabilidade</strong> — o arquivo de backup JSON pode ser usado em qualquer sistema compatível</li>
    </ul>
  </div>

  <div class="info-section">
    <div class="info-section-title">7. Alterações nesta Política</div>
    <p>Esta política pode ser atualizada. Quaisquer alterações serão refletidas nesta mesma seção do aplicativo. Recomendamos revisão periódica.</p>
    <div class="info-last-update">Versão 1.0 · Conformidade LGPD · Janeiro 2025</div>
  </div>
</div>`;
}

// ════════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════════
function toast(msg,type='ok'){
  const icons={ok:'✅',err:'❌',info:'ℹ️'};
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<span>${icons[type]||'💬'}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 3200);
}

// ════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════
async function init() {
  try {
    await IDB.open();
    [pagar,receber,tarefas,eventos,notas] = await Promise.all([
      IDB.getAll('pagar'),
      IDB.getAll('receber'),
      IDB.getAll('tarefas'),
      IDB.getAll('eventos'),
      IDB.getAll('notas'),
    ]);
  } catch(e) {
    console.warn('IndexedDB indisponível, usando memória:', e);
    toast('IndexedDB não disponível neste contexto.','err');
  }
  bindNavItems();
  render();
}

init();

init();
