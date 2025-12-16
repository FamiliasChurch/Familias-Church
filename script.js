document.addEventListener('DOMContentLoaded', function() {

    // --- MENU MOBILE ---
    const mobileBtn = document.getElementById('mobileBtn');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });
        // Fecha o menu ao clicar em um link
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
});

// --- FUNÇÕES GLOBAIS (Chamadas pelo HTML onclick) ---

// 1. Abas Ministérios
function ativarAba(elemento) {
    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    elemento.classList.add('active');

    const displayImg = document.getElementById('tabImg');
    const displayTitulo = document.getElementById('tabTitulo');
    const displayDesc = document.getElementById('tabDesc');

    // Efeito de fade simples
    displayImg.style.opacity = '0';
    setTimeout(() => {
        displayImg.src = elemento.getAttribute('data-img');
        displayTitulo.textContent = elemento.getAttribute('data-titulo');
        displayDesc.textContent = elemento.getAttribute('data-desc');
        displayImg.style.opacity = '1';
    }, 200);
}

// 2. Mapas (Home) - CORREÇÃO AQUI
function trocarUnidade(estado) {    
    const contentPR = document.getElementById('conteudo-pr');
    const contentSC = document.getElementById('conteudo-sc');
    const btnPR = document.getElementById('btn-pr');
    const btnSC = document.getElementById('btn-sc');
    
    if (estado === 'pr') {
        // Remove hidden do PR, Adiciona hidden no SC
        contentPR.classList.remove('hidden');
        contentSC.classList.add('hidden');
        
        btnPR.classList.add('active');
        btnSC.classList.remove('active');
    } else {
        // Adiciona hidden no PR, Remove hidden do SC
        contentPR.classList.add('hidden');
        contentSC.classList.remove('hidden');
        
        btnSC.classList.add('active');
        btnPR.classList.remove('active');
    }
}

// 3. Doações - Alternar Oferta/Dízimo
document.addEventListener('DOMContentLoaded', function() {
    const formDizimo = document.querySelector('.form-custom');

    if (formDizimo) {
        formDizimo.addEventListener('submit', function() {
            // Pega o nome digitado
            const campoNome = this.querySelector('input[name="nome"]');
            // Pega o campo oculto do assunto
            const campoAssunto = this.querySelector('input[name="_subject"]');
            
            // Se achar os dois, atualiza o assunto
            if (campoNome && campoAssunto) {
                campoAssunto.value = "Dízimo - " + campoNome.value;
            }
        });
    }

});

function mostrarOpcao(tipo) {
    const boxOferta = document.getElementById('box-oferta');
    const boxDizimo = document.getElementById('box-dizimo');
    const botoes = document.querySelectorAll('.btn-toggle');

    // Remove classe ativa de todos
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

// 4. Copiar Pix
function copiarPix(idElemento) {
    const textoPix = document.getElementById(idElemento).innerText;
    navigator.clipboard.writeText(textoPix).then(() => {
        alert("Chave Pix copiada!");
    });
}

// 5. Formatar Moeda
function formatarMoeda(i) {
    var v = i.value.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    i.value = v;
}