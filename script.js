/* ==========================================================
   CONFIGURAÇÕES GERAIS COM DETECÇÃO DE NÍVEL
========================================================== */
const prefixo = window.location.pathname.includes('/admin/') ? '../' : './';

const CONFIG = {
    basePath: `${prefixo}content`,
    repo: "FamiliasChurch/FamiliasChurch"
};

let cacheConteudo = [];
let synth = window.speechSynthesis;
let utterance = null;

/* ==========================================================
   ORQUESTRADOR DE INICIALIZAÇÃO
========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    await carregarComponentes();
    initMenuMobile();

    const rotas = {
        'lista-proximos': carregarEventos,
        'evento-principal': carregarDestaquesHome,
        'lista-publicacoes': carregarFeed,
        'ministerios-tabs': initTabsMinisterios,
        'formOracao': initFormOracao,
        'box-oferta': () => mostrarOpcao('oferta'),
        'btn-pr': () => trocarUnidade('pr'),
        'passkey': initAdminObreiros
    };

    Object.keys(rotas).forEach(id => {
        if (document.getElementById(id)) rotas[id]();
    });

    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) window.netlifyIdentity.on("login", () => document.location.href = "/admin/");
        });
    }
});

/* ==========================================================
   1. CORE: COMPONENTIZAÇÃO
========================================================== */
async function carregarComponentes() {
    const itens = [{ id: 'header', file: 'header' }, { id: 'footer', file: 'footer' }];
    const promessas = itens.map(async item => {
        const el = document.getElementById(item.id);
        if (el) {
            try {
                const res = await fetch(`${prefixo}components/${item.file}.html`);
                el.innerHTML = await res.text();
            } catch (e) { console.error(`Erro ao carregar ${item.file}`); }
        }
    });
    await Promise.all(promessas);
}

function initMenuMobile() {
    const btn = document.getElementById('mobileBtn');
    const menu = document.querySelector('.nav-menu');
    if (!btn || !menu) return;

    const toggleState = () => {
        const isActive = menu.classList.toggle('active');
        btn.classList.toggle('active');
        document.body.classList.toggle('menu-open', isActive);
    };

    btn.onclick = toggleState;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            menu.classList.remove('active');
            btn.classList.remove('active');
            document.body.classList.remove('menu-open');
        };
    });
}

/* ==========================================================
   2. GESTÃO DE DADOS (JSON)
========================================================== */
async function fetchConteudo(subpasta) {
    try {
        const res = await fetch(`${CONFIG.basePath}/${subpasta}/index.json`);
        const arquivos = await res.json();
        return Promise.all(arquivos.map(f => fetch(`${CONFIG.basePath}/${subpasta}/${f}`).then(r => r.json())));
    } catch (e) { return []; }
}

async function carregarEventos() {
    const eventos = await fetchConteudo('eventos');
    const agora = new Date();
    const ordenador = (a, b) => (a.is_special !== b.is_special ? (a.is_special ? -1 : 1) : new Date(a.date) - new Date(b.date));

    const proximos = eventos.filter(e => new Date(e.date) >= agora).sort(ordenador);
    const passados = eventos.filter(e => new Date(e.date) < agora).sort((a, b) => new Date(b.date) - new Date(a.date));

    renderizarCards(proximos, 'lista-proximos');
    renderizarCards(passados, 'lista-passados', true);
}

function renderizarCards(lista, containerId, isPast = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (lista.length === 0) { container.innerHTML = "<p>Nenhum registro encontrado.</p>"; return; }

    container.innerHTML = lista.map(e => `
        <div class="card-evento ${e.is_special ? 'destaque-encontro' : ''} ${isPast ? 'evento-passado' : ''}">
            <div class="card-img"><img src="${e.image}" alt="${e.title}"></div>
            <div class="card-info">
                ${e.is_special ? '<span class="badge">Destaque</span>' : ''}
                <h3>${e.title}</h3>
                <p class="data">${new Date(e.date).toLocaleDateString('pt-BR')}</p>
                <p class="descricao">${e.body?.substring(0, 100)}...</p>
                ${!isPast ? `<a href="eventos.html" class="btn-card">Saber mais</a>` : ''}
            </div>
        </div>
    `).join('');
}

/* ==========================================================
   3. FEED DE PUBLICAÇÕES (COM FILTROS)
========================================================== */
async function carregarFeed() {
    const folders = ['devocionais', 'estudos'];
    const promessas = folders.map(f => fetchConteudo(`publicacoes/${f}`));
    const resultados = await Promise.all(promessas);

    // Cache para filtros rápidos sem novo fetch
    cacheConteudo = resultados.flat().sort((a, b) => new Date(b.date) - new Date(a.date));

    renderizarFeed(cacheConteudo);
    initFiltrosPublicacoes();
}

function renderizarFeed(lista) {
    const container = document.getElementById('lista-publicacoes');
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = "<p>Nenhuma mensagem encontrada.</p>";
        return;
    }

    container.innerHTML = lista.map(p => `
        <div class="card-evento">
            <div class="card-info">
                <span class="badge">${p.tipo?.toUpperCase() || 'MENSAGEM'}</span>
                <h3>${p.title}</h3>
                <p class="data">${new Date(p.date).toLocaleDateString('pt-BR')}</p>
                <p class="descricao">${p.body.substring(0, 150)}...</p>
                <button class="btn-hero" style="margin-top:20px; font-size:0.7rem; padding:10px 20px;" onclick="abrirLeitura('${p.title}')">Ler Mensagem</button>
            </div>
        </div>
    `).join('');
}

function initFiltrosPublicacoes() {
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(btn => {
        btn.onclick = () => {
            botoes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tipo = btn.getAttribute('data-tipo');
            const filtrados = tipo === 'todos' ? cacheConteudo : cacheConteudo.filter(p => p.tipo === tipo);
            renderizarFeed(filtrados);
        };
    });
}

function abrirLeitura(titulo) {
    const pub = cacheConteudo.find(p => p.title === titulo);
    const modal = document.getElementById('modalLeitura');
    const display = document.getElementById('conteudo-completo-leitura');
    const htmlBody = typeof marked !== 'undefined' ? marked.parse(pub.body) : pub.body;

    display.innerHTML = `
        <div class="controles-audio">
            <button onclick="iniciarLeitura()" id="btnOuvir" class="btn-audio">🔊 Ouvir</button>
            <button onclick="pararLeitura()" id="btnParar" class="btn-audio hidden">⏹️ Parar</button>
        </div>
        <small class="badge" style="display:inline-block; margin-bottom:10px;">${pub.tipo?.toUpperCase()}</small>
        <h1 style="font-family: 'Playfair Display', serif; margin-bottom: 10px;">${pub.title}</h1>
        <p><strong>Por: ${pub.autor}</strong></p>
        <hr style="margin:20px 0;"><div class="texto-completo">${htmlBody}</div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

/* ==========================================================
   4. UTILITÁRIOS & HOME
========================================================== */
function fecharLeitura() { pararLeitura(); document.getElementById('modalLeitura').style.display = "none"; document.body.style.overflow = "auto"; }

async function carregarDestaquesHome() {
    const eventos = await fetchConteudo('eventos');
    const agora = new Date();
    const proximos = eventos.filter(e => new Date(e.date) >= agora).sort((a, b) => (a.is_special ? -1 : 1));
    const cp = document.getElementById('evento-principal');
    if (!cp || proximos.length === 0) return;

    // Dentro de carregarDestaquesHome()
    const p = proximos[0];
    cp.innerHTML = `
        <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; opacity:0.85;">
        <div class="info-overlay">
            <span class="badge-flutuante">DESTAQUE</span>
            <h3 class="titulo-flutuante">${p.title}</h3>
            
            <div class="hero-buttons">
                <a href="eventos.html" class="btn-saiba-mais">SAIBA MAIS</a>
                <button class="btn-share-whatsapp" onclick="compartilharWhatsapp('${p.title}', '${new Date(p.date).toLocaleDateString('pt-BR')}')">
                    <i class="fa-brands fa-whatsapp"></i>
                </button>
            </div>
        </div>
    `;
    const cs = document.getElementById('eventos-secundarios');
    if (cs) cs.innerHTML = s.map(ev => `<div class="card-secundario"><img src="${ev.image}"><div class="info-pequena"><h4>${ev.title}</h4><p>${new Date(ev.date).toLocaleDateString('pt-BR')}</p><a href="eventos.html">SAIBA MAIS →</a></div></div>`).join('');
}

// ... manter funções auxiliares (copiarPix, formatarMoeda, compartilharWhatsapp) ...

function copiarPix(id) { navigator.clipboard.writeText(document.getElementById(id).innerText).then(() => alert("Chave Pix copiada!")); }
function formatarMoeda(i) { let v = i.value.replace(/\D/g, ''); v = (v / 100).toFixed(2).replace(".", ",").replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,").replace(/(\d)(\d{3}),/g, "$1.$2,"); i.value = v; }

function trocarUnidade(unidade) {
    const c = { pr: { b: 'btn-pr', ct: 'conteudo-pr', h: ['btn-sc', 'conteudo-sc'] }, sc: { b: 'btn-sc', ct: 'conteudo-sc', h: ['btn-pr', 'conteudo-pr'] } }[unidade];
    document.getElementById(c.b)?.classList.add('active');
    document.getElementById(c.ct)?.classList.remove('hidden');
    c.h.forEach(id => { document.getElementById(id)?.classList.remove('active'); if (id.startsWith('conteudo')) document.getElementById(id)?.classList.add('hidden'); });
}

function mostrarOpcao(tipo) {
    const o = document.getElementById('box-oferta'), d = document.getElementById('box-dizimo'), bt = document.querySelectorAll('.btn-toggle');
    if (tipo === 'oferta') { o?.classList.remove('hidden'); d?.classList.add('hidden'); bt[0]?.classList.add('active'); bt[1]?.classList.remove('active'); }
    else { o?.classList.add('hidden'); d?.classList.remove('hidden'); bt[1]?.classList.add('active'); bt[0]?.classList.remove('active'); }
}

function initFormOracao() {
    const ck = document.getElementById('anonimo'), ct = document.getElementById('identificacao-container');
    if (!ck || !ct) return;
    ck.onchange = () => { ct.style.display = ck.checked ? 'none' : 'block'; ct.querySelectorAll('input').forEach(i => i.required = !ck.checked); };
}

function compartilharWhatsapp(t, d) { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Paz! Veja este evento na Famílias Church:\n📌 *${t}*\n📅 ${d}\nConfira: ${window.location.origin}/eventos.html`)}`, '_blank'); }

// Função placeholder para Admin
function initAdminObreiros() { console.log("Admin pronto"); }

/* ==========================================================
   LÓGICA DE MINISTÉRIOS (TABS)
========================================================== */
function initTabsMinisterios() {
    const container = document.getElementById('ministerios-tabs');
    if (!container) return;

    const botoes = container.querySelectorAll('.tab-btn');
    const displayImg = document.querySelector('.tab-img-box img');
    const displayTitulo = document.querySelector('.tab-text-box h3');
    const displayTexto = document.querySelector('.tab-text-box p');

    const dados = {
        "LOUVOR": { img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070", txt: "Levando a igreja à adoração profunda através da música." },
        "FAMÍLIAS": { img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070", txt: "Edificando lares sobre a rocha que é a Palavra de Deus." },
        "DÉBORAS": { img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070", txt: "Mães de joelhos, filhos de pé. Intercessão contínua." },
        "JOVENS": { img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070", txt: "Uma geração apaixonada por Jesus e pelo Seu Reino." },
        "TEENS": { img: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070", txt: "Adolescentes crescendo em sabedoria e graça." },
        "KIDS": { img: "https://images.unsplash.com/photo-1484981138541-3d074aa97716?q=80&w=2070", txt: "Plantando a semente da vida no coração dos pequenos." },
        "TEATRO": { img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=2070", txt: "Expressando o Evangelho através da arte dramática." },
        "DANÇA": { img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2070", txt: "Adoração em movimento e gratidão ao Criador." }
    };

    botoes.forEach(btn => {
        btn.onclick = () => {
            const chave = btn.innerText.trim().toUpperCase();
            if (dados[chave]) {
                botoes.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Transição visual
                document.querySelector('.tab-content-display').style.opacity = 0;
                setTimeout(() => {
                    displayImg.src = dados[chave].img;
                    displayTitulo.innerText = chave;
                    displayTexto.innerText = dados[chave].txt;
                    document.querySelector('.tab-content-display').style.opacity = 1;
                }, 200);
            }
        };
    });
}