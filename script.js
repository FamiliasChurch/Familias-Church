/* ==========================================================
   1. CONFIGURAÇÕES INICIAIS E EVENTOS AO CARREGAR
========================================================== */
document.addEventListener('DOMContentLoaded', function() {

    // --- MENU MOBILE ---
    const mobileBtn = document.getElementById('mobileBtn');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileBtn.classList.remove('active'); 
            });
        });
    }

    // --- FORMULÁRIO DE ORAÇÃO (HOME) ---
    const checkAnonimo = document.getElementById('anonimo');
    if (checkAnonimo) {
        const divIdentificacao = document.getElementById('identificacao-container');
        const inputNome = document.getElementById('nome');
        const inputTelefone = document.getElementById('telefone');
        
        checkAnonimo.addEventListener('change', function() {
            if (this.checked) {
                divIdentificacao.style.display = 'none';
                inputNome.removeAttribute('required');
                inputTelefone.removeAttribute('required');
            } else {
                divIdentificacao.style.display = 'block';
                inputNome.setAttribute('required', 'true');
                inputTelefone.setAttribute('required', 'true');
            }
        });
    }

    // --- PERSONALIZAÇÃO ASSUNTO DÍZIMO (PÁGINA DOAÇÕES) ---
    const formDizimo = document.querySelector('.form-custom');
    if (formDizimo) {
        formDizimo.addEventListener('submit', function() {
            const campoNome = this.querySelector('input[name="nome"]');
            const campoAssunto = this.querySelector('input[name="_subject"]');
            if (campoNome && campoAssunto) {
                campoAssunto.value = "Dízimo - " + campoNome.value;
            }
        });
    }

    // --- REDIRECIONAMENTO ADMIN (NETLIFY IDENTITY) ---
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) {
                window.netlifyIdentity.on("login", () => {
                    document.location.href = "/admin/";
                });
            }
        });
    }

    // --- DISPARAR CARREGAMENTO DE CONTEÚDO DINÂMICO ---
    if (document.getElementById('lista-proximos')) {
        carregarEventos(); // Carrega página de eventos.html
    }
    
    if (document.getElementById('evento-principal')) {
        carregarDestaquesHome(); // Carrega destaques da index.html
    }
});

/* ==========================================================
   2. LÓGICA DO BLOG/EVENTOS (PÁGINA EVENTOS.HTML)
========================================================== */
async function carregarEventos() {
    // Lista dos arquivos JSON na pasta content/eventos
    // IMPORTANTE: Adicione o nome dos novos arquivos aqui sempre que criá-los
    const arquivos = [
        '2025-12-18-encontro-com-deus.json',
        // 'outro-evento.json', 
    ];

    const listaProximos = document.getElementById('lista-proximos');
    const listaPassados = document.getElementById('lista-passados');
    const agora = new Date();

    try {
        // 1. Buscar todos os arquivos JSON
        const promessas = arquivos.map(file => fetch(`./content/eventos/${file}`).then(res => res.json()));
        const eventos = await promessas;

        // 2. Separar e Ordenar
        const proximos = eventos.filter(ev => new Date(ev.data) >= agora);
        const passados = eventos.filter(ev => new Date(ev.data) < agora);

        const ordenador = (a, b) => {
            // Regra 1: "Encontro com Deus" sempre no topo
            if (a.isEncontroComDeus !== b.isEncontroComDeus) {
                return a.isEncontroComDeus ? -1 : 1;
            }
            // Regra 2: Ordenar por data (mais próximos primeiro)
            return new Date(a.data) - new Date(b.data);
        };

        // 3. Renderizar
        renderizar(proximos.sort(ordenador), listaProximos);
        renderizar(passados.sort(ordenador), listaPassados, true);

    } catch (erro) {
        console.error("Erro ao carregar eventos:", erro);
        listaProximos.innerHTML = "<p>Erro ao carregar eventos.</p>";
    }
}

function renderizar(lista, container, isPast = false) {
    container.innerHTML = ""; // Limpa os skeletons

    if (lista.length === 0) {
        container.innerHTML = "<p>Nenhum evento agendado no momento.</p>";
        return;
    }

    lista.forEach(evento => {
        const dataFormatada = new Date(evento.data).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const card = `
            <div class="card-evento ${evento.isEncontroComDeus ? 'destaque-encontro' : ''} ${isPast ? 'evento-passado' : ''}">
                <div class="card-img">
                    <img src="${evento.imagem}" alt="${evento.titulo}">
                </div>
                <div class="card-info">
                    ${evento.isEncontroComDeus ? '<span class="badge">Destaque</span>' : ''}
                    <h3>${evento.titulo}</h3>
                    <p class="data">${dataFormatada}</p>
                    <p class="descricao">${evento.descricao ? evento.descricao.substring(0, 100) + '...' : ''}</p>
                    ${!isPast ? `<a href="#" class="btn-card">Saber mais</a>` : ''}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Inicia a função
carregarEventos();

/* ==========================================================
   3. DESTAQUES DA HOME (PÁGINA INDEX.HTML)
========================================================== */
async function carregarDestaquesHome() {
    const repoPath = "FamiliasChurch/FamiliasChurch";
    const folderPath = "content/eventos";
    const agora = new Date();
    const containerPrincipal = document.getElementById('evento-principal');
    const containerSecundarios = document.getElementById('eventos-secundarios');

    try {
        const response = await fetch(`https://api.github.com/repos/${repoPath}/contents/${folderPath}`);
        if (!response.ok) throw new Error("Erro API");
        
        const arquivos = await response.json();
        const promessas = arquivos.filter(arq => arq.name.endsWith('.json'))
                                  .map(arq => fetch(arq.download_url).then(res => res.json()));
        const eventos = await Promise.all(promessas);

        const proximos = eventos.filter(e => new Date(e.date) >= agora);

        if (proximos.length === 0) {
            // No trecho de Render Principal da index:
        containerPrincipal.innerHTML = `
            <div class="card-principal">
                <img src="${principal.image}" alt="${principal.title}">
                <div class="info-overlay">
                    <span>PRÓXIMO DESTAQUE</span>
                    <h3>${principal.title}</h3>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <a href="eventos.html" class="btn-copy" style="width: fit-content; margin-top:15px">Saiba Mais</a>
                        <button class="btn-share-whatsapp" style="margin-top:15px" onclick="compartilharWhatsapp('${principal.title}', '${new Date(principal.date).toLocaleDateString('pt-BR')}')">
                            📲
                        </button>
                    </div>
                </div>
            </div>`
        ;
            containerSecundarios.innerHTML = "";
            return;
        }

        const principal = proximos.find(e => e.is_special) || proximos[0];
        const secundarios = proximos.filter(e => e !== principal).slice(0, 2);

        // Render Principal
        containerPrincipal.innerHTML = `
            <div class="card-principal">
                <img src="${principal.image}" alt="${principal.title}">
                <div class="info-overlay">
                    <span>PRÓXIMO DESTAQUE</span>
                    <h3>${principal.title}</h3>
                    <a href="eventos.html" class="btn-copy" style="width: fit-content; margin-top:15px">Saiba Mais</a>
                </div>
            </div>
        `;

        // Render Secundários
        containerSecundarios.innerHTML = secundarios.map(ev => `
            <div class="card-secundario">
                <img src="${ev.image}">
                <div class="info-pequena">
                    <h4 style="color: var(--cor-primaria)">${ev.title}</h4>
                    <p style="font-size: 0.8rem; color: #666">${new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                    <a href="eventos.html" style="color: var(--cor-destaque); font-weight: bold; font-size: 0.8rem">SAIBA MAIS →</a>
                </div>
            </div>
        `).join('');

    } catch (err) { 
        console.error("Erro nos destaques:", err);
        containerPrincipal.innerHTML = "";
    }
}

/* ==========================================================
   4. FUNÇÕES GLOBAIS (CHAMADAS VIA ONCLICK NO HTML)
========================================================== */

function trocarUnidade(estado) {    
    const contentPR = document.getElementById('conteudo-pr');
    const contentSC = document.getElementById('conteudo-sc');
    const btnPR = document.getElementById('btn-pr');
    const btnSC = document.getElementById('btn-sc');
    
    if (estado === 'pr') {
        contentPR.classList.remove('hidden');
        contentSC.classList.add('hidden');
        btnPR.classList.add('active');
        btnSC.classList.remove('active');
    } else {
        contentPR.classList.add('hidden');
        contentSC.classList.remove('hidden');
        btnSC.classList.add('active');
        btnPR.classList.remove('active');
    }
}

function ativarAba(elemento) {
    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');

    const displayImg = document.getElementById('tabImg');
    const displayTitulo = document.getElementById('tabTitulo');
    const displayDesc = document.getElementById('tabDesc');

    displayImg.style.opacity = '0';
    setTimeout(() => {
        displayImg.src = elemento.getAttribute('data-img');
        displayTitulo.textContent = elemento.getAttribute('data-titulo');
        displayDesc.textContent = elemento.getAttribute('data-desc');
        displayImg.style.opacity = '1';
    }, 200);
}

function mostrarOpcao(tipo) {
    const boxOferta = document.getElementById('box-oferta');
    const boxDizimo = document.getElementById('box-dizimo');
    const botoes = document.querySelectorAll('.btn-toggle');
    botoes.forEach(btn => btn.classList.remove('active'));

    if (tipo === 'oferta') {
        if(boxOferta) boxOferta.classList.remove('hidden');
        if(boxDizimo) boxDizimo.classList.add('hidden');
        if(botoes[0]) botoes[0].classList.add('active');
    } else {
        if(boxOferta) boxOferta.classList.add('hidden');
        if(boxDizimo) boxDizimo.classList.remove('hidden');
        if(botoes[1]) botoes[1].classList.add('active');
    }
}

function copiarPix(id) {
    const texto = document.getElementById(id).innerText;
    navigator.clipboard.writeText(texto).then(() => alert("Chave Pix copiada!"));
}

function formatarMoeda(i) {
    let v = i.value.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    i.value = v;
}

// --- FUNÇÃO PARA PARTILHAR NO WHATSAPP ---
function compartilharWhatsapp(titulo, data) {
    const urlSite = window.location.href; // Pega o link da página atual
    const mensagem = encodeURIComponent(
        `Olá! Veja este evento na Famílias Church:\n\n` +
        `📌 *${titulo}*\n` +
        `📅 ${data}\n\n` +
        `Confira os detalhes no site: ${urlSite}`
    );
    
    // Abre o WhatsApp com a mensagem pronta
    window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
}