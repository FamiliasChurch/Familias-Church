// netlify/functions/publicar.js
const fetch = require('node-fetch'); // O Netlify já lida com isso

exports.handler = async (event) => {
    // Só aceita requisições POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método não permitido" };
    }

    const { payload, path } = JSON.parse(event.body);
    const TOKEN = process.env.GH_TOKEN; // A mágica acontece aqui!
    const REPO = "FamiliasChurch/FamiliasChurch";

    const contentBase64 = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

    try {
        const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Postagem via Portal: ${payload.title}`,
                content: contentBase64
            })
        });

        if (response.ok) {
            return { statusCode: 200, body: JSON.stringify({ msg: "Sucesso!" }) };
        } else {
            const error = await response.json();
            return { statusCode: 400, body: JSON.stringify(error) };
        }
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    }
};