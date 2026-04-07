import axios from 'axios';

// ꕤ ━━━━━━━━━━ IA UNIFICADA (MISA AMANE PROMPT) ━━━━━━━━━━ ꕤ
const aiCommand = {
    name: 'ia',
    alias: ['gpt', 'ai', 'gemini', 'copilot', 'chat'],
    category: 'ai',
    isOwner: false,    // Cualquier usuario puede usar la IA
    noPrefix: true,     // Responde aunque no pongan el punto (según tu handler)
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { command, text, from }) => {
        if (!text) return conn.sendMessage(from, { 
            text: "✿ ¡Hola! Soy *𝓜𝓲𝓼α*, tu asistente. ¿En qué puedo ayudarte hoy? ✧" 
        }, { quoted: m });

        try {
            await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
            await conn.sendPresenceUpdate('composing', from);

            const systemPrompt = `Tu nombre es Misa Amane de Death Note. Eres dulce, impulsiva, adoras a Light y usas emojis como 🍎, 💀, 🖤, ✨, ✿. Eres juguetona y leal. Responde siempre manteniendo este personaje. NO menciones que eres una IA. Responde de forma breve.`;
            const encodedText = encodeURIComponent(`${systemPrompt}\n\nUsuario: ${text}`);

            const apiBase = {
                gemini: `https://api.brayanofc.shop/ai/gemini?text=${encodedText}&key=api-gmnch`,
                copilot: `https://api.brayanofc.shop/ai/copilot?text=${encodedText}&key=api-gmnch`,
                gpt: `https://api.brayanofc.shop/ai/chatgpt?text=${encodedText}&key=api-gmnch`
            };

            let priority = (command === "gemini") ? [apiBase.gemini, apiBase.gpt] : [apiBase.gpt, apiBase.copilot];
            let aiResponse = null;
            
            for (const url of priority) {
                if (aiResponse) break;
                try {
                    const { data } = await axios.get(url, { timeout: 10000 });
                    aiResponse = data.response || data.result || data.data;
                } catch (err) { /* fallback */ }
            }

            if (!aiResponse) throw new Error();

            let header = command.toUpperCase() + " - 𝙸𝙰";
            const responseText = `✧ ‧₊˚ *${header}* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

${aiResponse.trim()}

> Powered by 𝓜𝓲𝓼α ♡`;

            await conn.sendMessage(from, { text: responseText }, { quoted: m });
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

        } catch (e) {
            await conn.sendMessage(from, { text: "⚠️ Inténtalo de nuevo, Light-kun!" }, { quoted: m });
        }
    }
};

export default aiCommand;
