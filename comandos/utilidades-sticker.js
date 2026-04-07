/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import { downloadContentFromMessage, getContentType, downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import P from 'pino';

const stickerCommand = {
    name: 's',
    alias: ['sticker', 'stiker'],
    category: 'tools',
    isOwner: false,    // Cualquier usuario puede hacer stickers
    noPrefix: true,   // Mejor dejarlo con prefijo para evitar que confunda fotos normales
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { command, from }) => {
        const chatId = from;
        if (!chatId) return;

        // Definimos el quoted manualmente para evitar errores de referencia
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        let mediaMessage = null;
        let mediaMime = '';
        let mediaType = '';

        // 1. Detección de media en quoted (respondido)
        if (quoted) {
            const quotedType = getContentType(quoted);
            if (quotedType && /image|video|sticker/.test(quotedType)) {
                mediaMessage = quoted[quotedType];
                mediaMime = mediaMessage?.mimetype || '';
                mediaType = quotedType;
            }
        }

        // 2. Detección de media en mensaje directo
        if (!mediaMessage) {
            const msgType = getContentType(m.message);
            if (msgType && /image|video/.test(msgType)) {
                mediaMessage = m.message[msgType];
                mediaMime = mediaMessage?.mimetype || '';
                mediaType = msgType;
            }
        }

        // 3. Respuesta si no hay media
        if (!mediaMessage) {
            return conn.sendMessage(chatId, {
                text: "› ✐  *Uso:* Responde a una imagen o video con `.s` ✧"
            }, { quoted: m });
        }

        await conn.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        // Mensaje de estado con estética Misa
        let statusMsg = await conn.sendMessage(chatId, {
            text: "⛓️ *𝐂𝐨𝐧𝐯𝐢𝐞𝐫𝐭𝐢𝐞𝐧𝐝𝐨...* ✧\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡"
        }, { quoted: m });

        try {
            let isLongVideo = false;
            if (/video/.test(mediaMime) && mediaMessage?.seconds > 12) {
                isLongVideo = true;
            }

            let buffer;
            try {
                let dlType = 'image';
                if (/video/.test(mediaMime || mediaType)) dlType = 'video';
                else if (/webp|sticker/.test(mediaMime || mediaType)) dlType = 'sticker';

                const stream = await downloadContentFromMessage(mediaMessage, dlType);
                let chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                buffer = Buffer.concat(chunks);
            } catch (dlErr) {
                buffer = await downloadMediaMessage(m, 'buffer', {}, { 
                    logger: P({ level: 'silent' }),
                    reuploadRequest: conn.updateMediaMessage 
                });
            }

            if (!buffer || buffer.length < 100) throw new Error("Buffer vacío");

            const sticker = new Sticker(buffer, {
                pack: '𝓜𝓲𝓼𝓪 𝘽𝙊𝙏 🖤', // Nombre del paquete
                author: 'Yanniel',     // Autor
                type: StickerTypes.FULL,
                quality: 60,
                fps: 15,
                endTime: '00:00:12' 
            });

            const stickerBuffer = await sticker.toBuffer();

            // Enviamos el sticker
            await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: m });

            // Mensaje final editado
            await conn.sendMessage(chatId, {
                text: isLongVideo ? "⚠️ *Recortado a 12s*" : "✨ *𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐥𝐢𝐬𝐭𝐨* 🖤",
                edit: statusMsg.key
            });

            await conn.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Sticker Error:", e);
            await conn.sendMessage(chatId, { react: { text: "❌", key: m.key } });
            await conn.sendMessage(chatId, {
                text: `❌ *𝐄𝐑𝐑𝐎𝐑:* Reintenta enviando de nuevo el archivo.`,
                edit: statusMsg.key
            });
        }
    }
};

export default stickerCommand;
