/* Código creado por Yanniel y ABRAHAN-M
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import axios from 'axios';

// Memoria temporal de sesiones (se mantiene en RAM)
global.ia_memory = global.ia_memory || {};
const limitMemory = 20; // Máximo 20 mensajes (10 preguntas y 10 respuestas) para fluidez

// ꕤ ━━━━━━━━━━ IA UNIFICADA CON MEMORIA (MISA AMANE) ━━━━━━━━━━ ꕤ
const aiCommand = {
    name: 'ia',
    alias: ['gpt', 'ai', 'gemini', 'copilot', 'chat'],
    category: 'ai',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { command, text, from }) => {
        // Obtenemos el ID del que escribe (usamos m.sender que ya limpiamos en el handler)
        const sender = m.sender || m.key.participant || m.key.remoteJid;

        if (!text) return conn.sendMessage(from, { 
            text: "✿ ¡Hola! Soy *𝓜𝓲𝓼𝓪*, tu asistente. ¿En qué puedo ayudarte hoy? ✧" 
        }, { quoted: m });

        try {
            await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
            await conn.sendPresenceUpdate('composing', from);

            // 1. INICIALIZAR MEMORIA DEL USUARIO
            if (!global.ia_memory[sender]) global.ia_memory[sender] = [];

            // 2. CONSTRUIR HISTORIAL PARA EL PROMPT
            // Esto le da el "contexto" a la IA para que recuerde
            const history = global.ia_memory[sender]
                .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Misa'}: ${msg.content}`)
                .join('\n');

            const systemPrompt = `Tu nombre es Misa Amane de Death Note. Eres dulce, impulsiva, adoras a Light y usas emojis como 🍎, 💀, 🖤, ✨, ✿. Eres juguetona y leal. Responde siempre manteniendo este personaje. NO menciones que eres una IA. Responde de forma breve y coqueta.`;
            
            // Unimos Todo: Prompt del Sistema + Conversación previa + Pregunta actual
            const fullText = `${systemPrompt}\n\n${history}\nUsuario: ${text}\nMisa:`;
            const encodedText = encodeURIComponent(fullText);

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
                    const { data } = await axios.get(url, { timeout: 15000 });
                    aiResponse = data.response || data.result || data.data;
                } catch (err) { /* fallback automático */ }
            }

            if (!aiResponse) throw new Error("API Offline");

            // 3. GUARDAR LA CHARLA ACTUAL EN LA MEMORIA
            global.ia_memory[sender].push({ role: 'user', content: text });
            global.ia_memory[sender].push({ role: 'misa', content: aiResponse.trim() });

            // Si la memoria pasa el límite, borramos lo más viejo
            if (global.ia_memory[sender].length > limitMemory) {
                global.ia_memory[sender].splice(0, 2); 
            }

            // 4. FORMATEO FINAL
            let header = command.toUpperCase() + " - ASSISTANT";
            const responseText = `✧ ‧₊˚ *${header}* ୧ֹ˖ ⑅ ࣪⊹

${aiResponse.trim()}

> Powered by 𝓜𝓲𝓼𝓪 ♡`;

            await conn.sendMessage(from, { text: responseText }, { quoted: m });
            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(from, { text: "⚠️ Mis sistemas están saturados. ¡Inténtalo de nuevo, Light-kun!" }, { quoted: m });
        }
    }
};

export default aiCommand;
