/* ==========================================================
   CONFIGURAÇÕES GERAIS
========================================================== */
const CONFIG = {
    basePath: './content',
    repo: "FamiliasChurch/FamiliasChurch"
};

let cacheConteudo = [];
let synth = window.speechSynthesis;
let utterance = null;

/* ==========================================================
   ORQUESTRADOR DE INICIALIZAÇÃO
========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carrega Componentes (Header/Footer)
    await carregarComponentes();

    // 2. Inicializa UI básica (Menu Mobile)
    initMenuMobile();

    // 3. ROTEADOR DE PÁGINAS
    const rotas = {
        'lista-proximos': carregarEventos,
        'evento-principal': carregarDestaquesHome,
        'lista-publicacoes': carregarFeed,
        'formOracao': initFormOracao,
        'box-oferta': () => mostrarOpcao('oferta'),
        'btn-pr': () => trocarUnidade('pr'),
        'passkey': initAdminObreiros // Se você tiver esta função definida
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
   1. CORE: COMPONENTIZAÇÃO E UI
========================================================== */
async function carregarComponentes() {
    const itens = [{ id: 'header', file: 'header' }, { id: 'footer', file: 'footer' }];
    const promessas = itens.map(async item => {
        const el = document.getElementById(item.id);
        if (el) {
            try {
                const res = await fetch(`./components/${item.file}.html`);
                el.innerHTML = await res.text();
            } catch (e) { console.error(`Erro ao carregar ${item.file}`); }
        }
    });
    await Promise.all(promessas);
}

// FUNÇÃO REVISADA PARA SINCRONIA COM CSS
function initMenuMobile() {
    const btn = document.getElementById('mobileBtn');
    const menu = document.querySelector('.nav-menu');
    if (!btn || !menu) return;

    // Função interna para alternar estados
    const toggleState = () => {
        const isActive = menu.classList.toggle('active');
        btn.classList.toggle('active');

        // Sincroniza com a trava de scroll do CSS
        if (isActive) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    };

    btn.onclick = toggleState;

    // Garante que ao clicar em um link (âncora), o menu feche e o scroll libere
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
   3. FEED DE PUBLICAÇÕES (DEVOCIONAIS/ESTUDOS)
========================================================== */
async function carregarFeed() {
    const folders = ['devocionais', 'estudos'];
    const promessas = folders.map(f => fetchConteudo(`publicacoes/${f}`));
    const resultados = await Promise.all(promessas);
    cacheConteudo = resultados.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
    renderizarFeed(cacheConteudo);
}

function renderizarFeed(lista) {
    const container = document.getElementById('lista-publicacoes');
    if (!container) return;
    container.innerHTML = lista.map(p => `
        <div class="card-publicacao">
            <span class="autor">${p.autor}</span>
            <h3>${p.title}</h3>
            <p class="data">${new Date(p.date).toLocaleDateString('pt-BR')}</p>
            <div class="texto-previo">${p.body.substring(0, 200)}...</div>
            <button class="btn-card" onclick="abrirLeitura('${p.title}')">Ler Mensagem</button>
        </div>
    `).join('');
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
        <small class="tipo-tag">${pub.tipo?.toUpperCase() || 'MENSAGEM'}</small>
        <h1 style="font-family: 'Playfair Display', serif; margin: 15px 0;">${pub.title}</h1>
        <p><strong>Por: ${pub.autor}</strong></p>
        <hr><div class="texto-completo">${htmlBody}</div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

/* ==========================================================
   4. UTILITÁRIOS
========================================================== */
function iniciarLeitura() {
    const texto = document.querySelector('.texto-completo').innerText;
    synth.cancel();
    utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.onend = pararLeitura;
    synth.speak(utterance);
    document.getElementById('btnOuvir').classList.add('hidden');
    document.getElementById('btnParar').classList.remove('hidden');
}

function pararLeitura() { synth.cancel(); document.getElementById('btnOuvir')?.classList.remove('hidden'); document.getElementById('btnParar')?.classList.add('hidden'); }
function fecharLeitura() { pararLeitura(); document.getElementById('modalLeitura').style.display = "none"; document.body.style.overflow = "auto"; }
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

/* ==========================================================
   5. HOME (DESTAQUES)
========================================================== */
async function carregarDestaquesHome() {
    const eventos = await fetchConteudo('eventos');
    const agora = new Date();
    const proximos = eventos.filter(e => new Date(e.date) >= agora).sort((a, b) => (a.is_special ? -1 : 1));
    const cp = document.getElementById('evento-principal');
    if (!cp || proximos.length === 0) return;

    const p = proximos[0], s = proximos.slice(1, 3);
    cp.innerHTML = `<div class="card-principal"><img src="${p.image}"><div class="info-overlay"><span>DESTAQUE</span><h3>${p.title}</h3><div style="display:flex; gap:10px;"><a href="eventos.html" class="btn-copy">Saiba Mais</a><button class="btn-share-whatsapp" onclick="compartilharWhatsapp('${p.title}', '${new Date(p.date).toLocaleDateString('pt-BR')}')">📲</button></div></div></div>`;

    const cs = document.getElementById('eventos-secundarios');
    if (cs) cs.innerHTML = s.map(ev => `<div class="card-secundario"><img src="${ev.image}"><div class="info-pequena"><h4>${ev.title}</h4><p>${new Date(ev.date).toLocaleDateString('pt-BR')}</p><a href="eventos.html">SAIBA MAIS →</a></div></div>`).join('');
}

function compartilharWhatsapp(t, d) { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Paz! Veja este evento na Famílias Church:\n📌 *${t}*\n📅 ${d}\nConfira: ${window.location.origin}/eventos.html`)}`, '_blank'); }

// Função placeholder para Admin
function initAdminObreiros() { console.log("Admin pronto"); }