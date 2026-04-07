/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const stickerCommand = {
    name: 's',
    alias: ['sticker', 'stiker'],
    category: 'tools',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { quoted }) => {
        const chat = m.key.remoteJid;

        // 1. BUSCADOR DE MEDIA (Súper compatible)
        // Buscamos en el mensaje citado o en el mensaje directo
        let msg = quoted ? quoted : m.message;
        let type = getContentType(msg);
        
        // Si es un mensaje citado, a veces el tipo viene dentro de 'viewOnceMessage' o similar
        if (type === 'viewOnceMessageV2' || type === 'viewOnceMessage') {
            msg = msg[type].message;
            type = getContentType(msg);
        }

        // Definimos qué mensajes contienen imagen/video/sticker
        const isMedia = /image|video|sticker/.test(type);
        const mediaMessage = isMedia ? msg[type] : null;
        const mime = mediaMessage?.mimetype || '';

        // 2. RESPUESTA SI NO HAY MEDIA (Estilo minimalista)
        if (!mediaMessage) {
            return conn.sendMessage(chat, {
                text: "› ✐  *Uso:* Responde a imagen o video con `.s`"
            }, { quoted: m });
        }

        await conn.sendMessage(chat, { react: { text: "⏳", key: m.key } });

        try {
            // 3. LÓGICA DE DESCARGA
            let dlType = /video/.test(mime) ? 'video' : (/webp/.test(mime) ? 'sticker' : 'image');
            const stream = await downloadContentFromMessage(mediaMessage, dlType);
            let chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            // 4. CREACIÓN DEL STICKER (Con recorte automático a 12s)
            const sticker = new Sticker(buffer, {
                pack: '𝐌𝐢𝐬𝐚 𝐁𝐎𝐓 🖤',
                author: 'Yanniel',
                type: StickerTypes.FULL,
                quality: 60,
                fps: 15,
                startTime: '00:00:00',
                endTime: '00:00:12'
            });

            const stickerBuffer = await sticker.toBuffer();

            // 5. ENVÍO
            await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m });
            await conn.sendMessage(chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(chat, { react: { text: "❌", key: m.key } });
            await conn.sendMessage(chat, { text: "❌ *𝐄𝐑𝐑𝐎𝐑:* No se pudo procesar." }, { quoted: m });
        }
    }
};

export default stickerCommand;
