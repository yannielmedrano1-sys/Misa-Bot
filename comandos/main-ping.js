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
            const start = Date.now();

            // 1. Enviamos el primer mensaje (Calculando .)
            const { key } = await conn.sendMessage(from, { text: '✧ ‧₊˚ *Calculando* .' });

            // Medimos la latencia real AQUÍ MISMO para que sea precisa
            const end = Date.now();
            const latencia = end - start;

            // 2. Animación Ultra Rápida (50ms entre puntos)
            await new Promise(resolve => setTimeout(resolve, 50);
            await conn.sendMessage(from, { text: '✧ ‧₊˚ *Calculando* . .', edit: key });

            await new Promise(resolve => setTimeout(resolve, 50));
            await conn.sendMessage(from, { text: '✧ ‧₊˚ *Calculando* . . .', edit: key });

            // 3. Resultado final con el MS real optimizado
            const finalMsg = ` 🖤  𝕻𝖔𝖓𝖌 ⊹ \`${latencia} ms\``;

            await conn.sendMessage(from, { 
                text: finalMsg, 
                edit: key,
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼α  𝙎𝙥𝙚𝙚𝙙 🖤',
                        body: `Latencia: ${latencia}ms | Status: Online`,
                        thumbnailUrl: 'https://i.pinimg.com/1200x/16/45/2a/16452ab8f2cca58dfb57e4218b3f51a1.jpg', 
                        sourceUrl: 'https://github.com/yannielmedrano1-sys/Misa-Bot',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            });

        } catch (err) {
            console.error('Error en comando ping:', err);
        }
    }
};

export default pingCommand;
