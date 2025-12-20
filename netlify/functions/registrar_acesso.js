const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" };

    const { adminNome, adminEmail, cargo } = JSON.parse(event.body);
    const TOKEN = process.env.GH_TOKEN;
    const REPO = "FamiliasChurch/FamiliasChurch";
    const PATH = "content/logs_acesso.json";

    try {
        // 1. Busca o arquivo de logs atual
        const resGet = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            headers: { 'Authorization': `token ${TOKEN}` }
        });
        
        let logs = [];
        let sha = undefined;

        if (resGet.ok) {
            const fileData = await resGet.json();
            sha = fileData.sha;
            logs = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
        }

        // 2. Adiciona o novo registro de acesso
        const novoLog = {
            data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            nome: adminNome,
            email: adminEmail,
            cargo: cargo,
            ip: event.headers['client-ip'] || "N/A"
        };

        logs.push(novoLog);
        
        // Mantém apenas os últimos 100 acessos para não sobrecarregar o arquivo
        if (logs.length > 100) logs.shift();

        // 3. Salva de volta no GitHub
        const contentBase64 = Buffer.from(JSON.stringify(logs, null, 2)).toString('base64');
        await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Log: Acesso administrativo de ${adminNome}`,
                content: contentBase64,
                sha: sha
            })
        });

        return { statusCode: 200, body: JSON.stringify({ msg: "Acesso registrado." }) };

    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
};