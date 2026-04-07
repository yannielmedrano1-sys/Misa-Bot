
import axios from 'axios';

const aiCommand = {
    name: 'ia',
    alias: ['gpt', 'ai', 'gemini', 'copilot', 'chat'],
    category: 'ai',
    run: async (conn, m, { command, text, from }) => {
        // 1. Validación de texto
        if (!text) return conn.sendMessage(from, { 
            text: "✿ ¡Hola! Soy *𝓜𝓲𝓼α*, tu asistente. ¿En qué puedo ayudarte hoy? ✧" 
        }, { quoted: m });

        try {
            await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
            await conn.sendPresenceUpdate('composing', from);

            // 2. Personalidad de Misa Amane
            const systemPrompt = `Tu nombre es Misa Amane de Death Note. Eres dulce, impulsiva, adoras a Light y usas emojis como 🍎, 💀, 🖤, ✨, ✿. Eres juguetona y leal. Responde siempre manteniendo este personaje. NO menciones que eres una IA. Responde de forma breve y coqueta.`;
            
            const fullText = `${systemPrompt}\n\nUsuario: ${text}`;
            const encodedText = encodeURIComponent(fullText);

            // 3. Motores de IA
            const apiBase = {
                gemini: `https://api.brayanofc.shop/ai/gemini?text=${encodedText}&key=api-gmnch`,
                copilot: `https://api.brayanofc.shop/ai/copilot?text=${encodedText}&key=api-gmnch`,
                gpt: `https://api.brayanofc.shop/ai/chatgpt?text=${encodedText}&key=api-gmnch`,
                sylphy: `https://sylphy.xyz/ai/gemini?q=${encodedText}&prompt=gemini&api_key=sylphy-zkacFeJ`
            };

            // Prioridad según el comando usado
            let priority = [];
            if (command === "gemini") priority = [apiBase.gemini, apiBase.sylphy, apiBase.gpt];
            else if (command === "copilot") priority = [apiBase.copilot, apiBase.gpt, apiBase.gemini];
            else priority = [apiBase.gpt, apiBase.copilot, apiBase.gemini];

            let aiResponse = null;
            
            // 4. Bucle de respaldo (Si una falla, intenta la otra)
            for (const url of priority) {
                if (aiResponse) break;
                try {
                    const { data } = await axios.get(url, { timeout: 10000 });
                    let temp = data.response || data.result || data.data || data.output;
                    if (temp) {
                        aiResponse = typeof temp === 'object' ? (temp.text || temp.output || JSON.stringify(temp)) : temp;
                    }
                } catch (err) {
                    console.log(`⚠️ Motor fallido, intentando respaldo...`);
                }
            }

            if (!aiResponse) throw new Error("Servidores fuera de línea.");

            // 5. Formateo de respuesta estilo Misa
            let header = "𝙸𝙰 - 𝙰𝚂𝚂𝙸𝚂𝚃𝙰𝙽𝚃";
            if (command === "gemini") header = "𝙶𝙴𝙼𝙸𝙽𝙸 - 𝙸𝙰";
            else if (command === "copilot") header = "𝙲𝙾𝙿𝙸𝙻𝙾𝚃 - 𝙸𝙰";

            const responseText = `✧ ‧₊˚ *${header}* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

${aiResponse.trim()}

> Powered by 𝓜𝓲𝓼α ♡`;

            await conn.sendMessage(from, { text: responseText }, { quoted: m });
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
            await conn.sendMessage(from, { 
                text: "⚠️ Mis sistemas están saturados. ¡Inténtalo de nuevo, Light-kun!" 
            }, { quoted: m });
        } finally {
            await conn.sendPresenceUpdate('paused', from);
        }
    }
};

export default aiCommand;
