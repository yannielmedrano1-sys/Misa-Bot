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

        // --- 1. BUSCADOR AGRESIVO DE MEDIA ---
        // Intentamos obtener el mensaje de 3 lugares distintos
        let targetMsg = quoted ? m.message.extendedTextMessage.contextInfo.quotedMessage : m.message;
        
        // Si es un mensaje citado, a veces viene envuelto en otra capa
        if (targetMsg?.viewOnceMessageV2) targetMsg = targetMsg.viewOnceMessageV2.message;
        if (targetMsg?.viewOnceMessage) targetMsg = targetMsg.viewOnceMessage.message;

        let type = getContentType(targetMsg);
        
        // Extraemos el contenido real (la imagen, el video o el sticker)
        let media = targetMsg?.[type];

        // --- 2. VALIDACIÓN DE CONTENIDO ---
        // Verificamos si realmente tenemos algo que convertir
        const isMedia = /image|video|sticker/.test(type) || /image|video|sticker/.test(media?.mimetype || '');

        if (!isMedia || !media) {
            return conn.sendMessage(chat, {
                text: "› ✐  *Uso:* Responde a imagen o video con `.s`"
            }, { quoted: m });
        }

        await conn.sendMessage(chat, { react: { text: "⏳", key: m.key } });

        try {
            // --- 3. DESCARGA ---
            const mime = media.mimetype || '';
            let dlType = /video/.test(mime) ? 'video' : (/webp/.test(mime) ? 'sticker' : 'image');
            
            const stream = await downloadContentFromMessage(media, dlType);
            let chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            // --- 4. GENERACIÓN (Corte automático a 12s) ---
            const sticker = new Sticker(buffer, {
                pack: '𝐌𝐢𝐬𝐚 𝐁𝐎𝐓 🖤',
                author: 'Yanniel',
                type: StickerTypes.FULL,
                quality: 60,
                fps: 15,
                endTime: '00:00:12'
            });

            const stickerBuffer = await sticker.toBuffer();

            // --- 5. ENVÍO Y REACCIÓN ---
            await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m });
            await conn.sendMessage(chat, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("ERROR STICKER:", e);
            await conn.sendMessage(chat, { react: { text: "❌", key: m.key } });
        }
    }
};

export default stickerCommand;
