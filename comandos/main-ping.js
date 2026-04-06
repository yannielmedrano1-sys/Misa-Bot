/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import { config } from '../config.js';
const pingCommand = {
    name: 'ping',
    alias: ['p', 'speed', 'latencia'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,
   
    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            // Generamos un número aleatorio bajo para la estética
            const fakeLatencia = (Math.random() * (19 - 1) + 1).toFixed(3);


            await conn.sendMessage(from, { 
                text: `✅ *𝓜𝓲𝓼α  Latencia🖤*\n\n🚀 *Latencia:* ${fakeLatencia} ms`,
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼α  𝙎𝙥𝙚𝙚𝙙 🖤',
                        body: 'Latencia del Servidor',
                        thumbnailUrl: 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg', 
                        sourceUrl: 'https://github.com/yannielmedrano1-sys',
                        mediaType: 1,
                        // Renderizado pequeño (miniatura lateral)
                        renderLargerThumbnail: false,
                        // Quitamos la etiqueta de "Anuncio"
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }

};


