import { performance } from 'perf_hooks';

const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            // Reaccionamos para indicar que estamos calculando
            await conn.sendMessage(from, { react: { text: '⚡', key: m.key } });

            // Marca de tiempo inicial
            const start = performance.now();
            
            // Enviamos un mensaje inicial de espera (con el quoted para que se vea la respuesta)
            const { key } = await conn.sendMessage(from, { text: '🚀 *Calculando Latencia...*' }, { quoted: m });
            
            // Marca de tiempo final
            const end = performance.now();
            const latencia = (end - start).toFixed(3);

            // --- CÓDIGO DE RESPUESTA MEJORADA (Con Previsualización) ---
            
            // Editamos el mensaje anterior con el formato final
            await conn.sendMessage(from, { 
                text: `✅ *Kazuma Bot Online*\n\n🚀 *Latencia:* ${latencia} ms`,
                edit: key,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - SPEED TEST',
                        body: 'Baileys Multi-Device Bot',
                        // --- FOTO IDÉNTICA AL MENÚ (GRANDE) ---
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        mediaType: 1,
                        // --- MINIATURA PEQUEÑA (CUADRADA ARRIBA) ---
                        renderLargerThumbnail: false 
                    }
                }
            });

        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }
};

export default pingCommand;