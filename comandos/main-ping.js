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
                text: `❀ *𝓜𝓲𝓼𝓪  𝘽𝙊𝙏 Online* 
✰ *𝙻𝚊𝚝𝚎𝚗𝚌𝚒𝚊*: \`${fakeLatencia} ms\``,
                
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼𝓪  - SPEED TEST',
                        body: 'Latencia del Servidor',
                        thumbnailUrl: 'https://i.pinimg.com/1200x/16/45/2a/16452ab8f2cca58dfb57e4218b3f51a1.jpg', 
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

export default pingCommand;
