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
    const repoPath = "FamiliasChurch/FamiliasChurch"; 
    const folderPath = "content/eventos";
    const listaProximos = document.getElementById('lista-proximos');
    const listaPassados = document.getElementById('lista-passados');
    const agora = new Date();

    try {
        const response = await fetch(`https://api.github.com/repos/${repoPath}/contents/${folderPath}`);
        if (!response.ok) throw new Error("Pasta de eventos não encontrada");
        
        const arquivos = await response.json();
        const arquivosJson = arquivos.filter(arq => arq.name.endsWith('.json'));

        const promessas = arquivosJson.map(arq => fetch(arq.download_url).then(res => res.json()));
        const eventos = await Promise.all(promessas);

        const proximos = eventos.filter(e => new Date(e.date) >= agora);
        const passados = eventos.filter(e => new Date(e.date) < agora);

        // Ordenação
        proximos.sort((a, b) => {
            if (a.is_special && !b.is_special) return -1;
            if (!a.is_special && b.is_special) return 1;
            return new Date(a.date) - new Date(b.date);
        });
        passados.sort((a, b) => new Date(b.date) - new Date(a.date));

        const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', {day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit'});

        const renderCard = (ev) => `
            <div class="card-evento ${ev.is_special ? 'destaque-especial' : ''}">
                <img src="${ev.image}" alt="${ev.title}" loading="lazy">
                <div class="card-info">
                    <span>${formatarData(ev.date)}</span>
                    <h3>${ev.title}</h3>
                    <div class="card-texto">${ev.body}</div>
                </div>
            </div>
        `;

        // Substitui os skeletons pelo conteúdo ou mensagem de vazio
        listaProximos.innerHTML = proximos.length ? proximos.map(renderCard).join('') : '<p class="aviso-vazio">Nenhum evento próximo agendado.</p>';
        listaPassados.innerHTML = passados.length ? passados.map(renderCard).join('') : '<p class="aviso-vazio">Sem histórico disponível.</p>';

    } catch (err) {
        console.error("Erro no Blog:", err);
        if(listaProximos) listaProximos.innerHTML = '<p>Erro ao carregar eventos.</p>';
    }
}

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
            containerPrincipal.innerHTML = "<p>Nenhum evento agendado no momento.</p>";
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