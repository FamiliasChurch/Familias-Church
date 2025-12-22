/* ==========================================================
    1. CONFIGURAÇÕES E INICIALIZAÇÃO (Agnóstico)
========================================================== */
const prefixo = window.location.pathname.includes('/admin/') ? '../' : './';

const firebaseConfig = {
    apiKey: "AIzaSyBvFM13K0XadCnAHdHE0C5GtA2TH5DaqLg",
    authDomain: "familias-church.firebaseapp.com",
    projectId: "familias-church",
    storageBucket: "familias-church.firebasestorage.app",
    messagingSenderId: "764183777206",
    appId: "1:764183777206:web:758e4f04ee24b86229bb17",
    measurementId: "G-VHWLCPM3FR"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();

let cropper;

/* ==========================================================
    2. NÚCLEO DE AUTENTICAÇÃO E COMPONENTES
========================================================== */
/* ==========================================================
    NÚCLEO DE AUTENTICAÇÃO (Sincronizado)
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o Netlify Identity explicitamente
    if (window.netlifyIdentity) {
        netlifyIdentity.init({
            API_URL: 'https://familiaschurch.netlify.app/.netlify/identity'
        });

        // 2. Aguarda o estado inicial (Resolve o "Carregando...")
        netlifyIdentity.on("init", user => {
            if (user) {
                console.log("Usuário detectado:", user.email);
                atualizarInterfaceUsuario(user);
                if (window.location.pathname.includes('perfil.html')) {
                    carregarDadosCompletosPerfil(user);
                }
            }
        });

        // 3. Lógica de Redirecionamento (Savepoint)
        netlifyIdentity.on("login", user => {
            const meta = user.user_metadata;
            console.log("Login realizado com sucesso!");

            // Verifica se o cadastro está incompleto
            if (!meta.whatsapp || !meta.nascimento) {
                window.location.href = prefixo + 'completar-perfil.html';
            } else {
                // Redireciona conforme o cargo
                const cargo = (meta.cargo || "").toLowerCase();
                if (["apóstolo", "apostolo", "financeiro", "admin"].includes(cargo)) {
                    window.location.href = prefixo + 'admin/index.html';
                } else {
                    window.location.href = prefixo + 'perfil.html';
                }
            }
        });

        // 4. Logout Limpo
        netlifyIdentity.on("logout", () => {
            localStorage.clear();
            window.location.href = prefixo + "index.html";
        });
    }
});

/* ==========================================================
    3. FUNÇÕES DE INTERFACE (Resolve cliques e UI)
========================================================== */
function atualizarInterfaceUsuario(user) {
    const meta = user.user_metadata;
    const foto = meta.avatar_url || "https://www.w3schools.com/howto/img_avatar.png";

    if (document.getElementById('avatarImg')) document.getElementById('avatarImg').src = foto;
    if (document.getElementById('userAvatarSmall')) document.getElementById('userAvatarSmall').src = foto;
    if (document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').innerText = meta.full_name || "Membro";
    if (document.getElementById('cargoUsuario')) document.getElementById('cargoUsuario').innerText = meta.cargo || "Membro";

    const btnAdmin = document.getElementById('adminFinanceiro');
    if (btnAdmin) {
        const cargo = (meta.cargo || "").toLowerCase();
        if (["apóstolo", "apostolo", "financeiro", "admin"].includes(cargo)) btnAdmin.classList.remove('hidden');
    }
}

async function carregarComponentes() {
    const itens = [{ id: 'header', file: 'header' }, { id: 'footer', file: 'footer' }];
    for (const item of itens) {
        const el = document.getElementById(item.id);
        if (el) {
            try {
                const res = await fetch(`${prefixo}components/${item.file}.html`);
                el.innerHTML = await res.text();
            } catch (e) { console.error("Erro componente:", item.file); }
        }
    }
}

// Funções de clique do perfil
function toggleMenu() { document.getElementById('profileCard')?.classList.toggle('active'); }
function toggleNotifications() { document.getElementById('noti-dropdown')?.classList.toggle('active'); }

/* ==========================================================
    4. DADOS (Firestore)
========================================================== */
async function carregarDadosCompletosPerfil(user) {
    const container = document.getElementById('lista-oracoes');
    if (!container) return;

    try {
        const snap = await db.collection("oracoes").where("email", "==", user.email).orderBy("data", "desc").get();
        container.innerHTML = snap.docs.map(doc => `
            <div class="item-registro">
                <p>${doc.data().texto}</p>
                <small>${doc.data().data?.toDate().toLocaleDateString('pt-BR')}</small>
            </div>
        `).join('') || '<p class="aviso-vazio">Nenhum pedido enviado.</p>';
    } catch (e) { console.error(e); }
}

/* ==========================================================
    5. COMPONENTES E UTILITÁRIOS
========================================================== */
async function carregarComponentes() {
    const itens = [{ id: 'header', file: 'header' }, { id: 'footer', file: 'footer' }];
    await Promise.all(itens.map(async item => {
        const el = document.getElementById(item.id);
        if (el) {
            try {
                const res = await fetch(`${prefixo}components/${item.file}.html`);
                el.innerHTML = await res.text();
            } catch (e) { console.error(`Erro: ${item.file}`); }
        }
    }));
}

function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "--";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

// MURAL DE TESTEMUNHOS (Firestore Real-time)
async function carregarMuralTestemunhos() {
    const container = document.getElementById('mural-testemunhos');
    if (!container) return;

    try {
        const snapshot = await db.collection("testemunhos")
            .where("status", "==", "Aprovado")
            .orderBy("data", "desc")
            .limit(6)
            .get();

        container.innerHTML = snapshot.docs.map(doc => {
            const t = doc.data();
            return `
                <div class="card-testemunho">
                    <p class="texto-testemunho">${t.texto}</p>
                    <div class="autor-testemunho"><strong>— ${t.autor}</strong></div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar mural:", err);
    }
}

// TROCA DE OFERTA/DÍZIMO (Interface Doações)
function mostrarOpcao(tipo) {
    const boxOferta = document.getElementById('box-oferta');
    const boxDizimo = document.getElementById('box-dizimo');
    const btns = document.querySelectorAll('.btn-toggle');

    btns.forEach(btn => btn.classList.remove('active'));

    if (tipo === 'oferta') {
        boxOferta.classList.remove('hidden');
        boxDizimo.classList.add('hidden');
        document.querySelector('button[onclick*="oferta"]').classList.add('active');
    } else {
        boxOferta.classList.add('hidden');
        boxDizimo.classList.remove('hidden');
        document.querySelector('button[onclick*="dizimo"]').classList.add('active');
    }
}

// REGISTRO DE DÍZIMOS (Firestore + ImgBB)
async function registrarDizimo(e) {
    e.preventDefault();
    const status = document.getElementById('statusDizimo');
    const file = document.getElementById('comprovanteFile').files[0];
    const valor = document.getElementById('valorDizimo').value;
    const user = netlifyIdentity.currentUser();

    if (!user) { alert("Faça login para registrar."); return; }

    status.innerText = "⏳ Enviando comprovante...";

    try {
        const formData = new FormData();
        formData.append('image', file);
        const resImg = await fetch('https://api.imgbb.com/1/upload?key=aa5bd2aacedeb43b6521a4f45d71b442', {
            method: 'POST', body: formData
        });
        const dataImg = await resImg.json();

        await db.collection("contribuicoes").add({
            email: user.email,
            nome: user.user_metadata.full_name || "Membro",
            valor: parseFloat(valor),
            comprovante: dataImg.data.url,
            data: firebase.firestore.FieldValue.serverTimestamp(),
            status: "Pendente"
        });

        alert("✅ Dízimo registrado com sucesso!");
        location.reload();
    } catch (err) { status.innerText = "❌ Erro no registro."; }
    const telFinanceiro = "55419XXXXXXXX"; // Coloque o número real aqui
    const msg = `Olá! Acabei de enviar o dízimo no valor de R$ ${valor}. O comprovante já está no sistema para aprovação.`;
    const urlWa = `https://wa.me/${telFinanceiro}?text=${encodeURIComponent(msg)}`;

    alert("✅ Dízimo registrado! Clique em OK para enviar o aviso no WhatsApp do Financeiro.");
    window.open(urlWa, '_blank');
    location.reload();
}

document.getElementById('formDizimoReal')?.addEventListener('submit', registrarDizimo);

// ENVIAR ORAÇÃO E LOGS
async function enviarOracao(e) {
    e.preventDefault();
    const user = netlifyIdentity.currentUser();
    const texto = document.getElementById('textoOracao').value;

    await db.collection("oracoes").add({
        email: user.email,
        texto: texto,
        data: firebase.firestore.FieldValue.serverTimestamp(),
        status: "Pendente"
    });
    alert("Pedido de oração enviado!");
}

async function registrarAcessoFirebase(user) {
    if (sessionStorage.getItem('acesso_firebase_ok')) return;
    try {
        await db.collection("logs").add({
            nome: user.user_metadata.full_name || "Admin",
            email: user.email,
            cargo: user.user_metadata.cargo || "Moderador",
            data: firebase.firestore.FieldValue.serverTimestamp(),
            ip: "Acesso Web"
        });
        sessionStorage.setItem('acesso_firebase_ok', 'true');
    } catch (err) { console.error("Erro log:", err); }
}

/* ==========================================================
    7. FUNCIONALIDADES DE PERFIL (UPLOAD)
========================================================== */
function initUploadAvatar() {
    const input = document.getElementById('fotoInput');
    if (!input) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.getElementById('imageToCrop');
            if (img) {
                img.src = event.target.result;
                document.getElementById('modalCrop').style.display = 'flex';
                if (cropper) cropper.destroy();
                cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1 });
            }
        };
        reader.readAsDataURL(file);
    });

    const btnSalvar = document.getElementById('btnSalvarCrop');
    if (btnSalvar) {
        btnSalvar.onclick = () => {
            const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
            const user = netlifyIdentity.currentUser();
            const status = document.getElementById('statusUpload');

            document.getElementById('modalCrop').style.display = 'none';
            if (status) status.innerText = "⏳ Enviando...";

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('image', blob);
                try {
                    const res = await fetch('https://api.imgbb.com/1/upload?key=aa5bd2aacedeb43b6521a4f45d71b442', {
                        method: 'POST', body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        await user.update({ data: { avatar_url: data.data.url } });
                        if (status) status.innerText = "✅ Atualizado!";
                        location.reload();
                    }
                } catch (err) { if (status) status.innerText = "❌ Erro"; }
            }, 'image/jpeg');
        };
    }
}