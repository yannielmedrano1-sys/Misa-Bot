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

        // 1. Detección de Media
        let mediaMessage = null;
        let mediaMime = '';
        let mediaType = '';

        if (quoted) {
            const quotedType = getContentType(quoted);
            if (quotedType && /image|video|sticker/.test(quotedType)) {
                mediaMessage = quoted[quotedType];
                mediaMime = mediaMessage?.mimetype || '';
                mediaType = quotedType;
            }
        }

        if (!mediaMessage) {
            const msgType = getContentType(m.message);
            if (msgType && /image|video/.test(msgType)) {
                mediaMessage = m.message[msgType];
                mediaMime = mediaMessage?.mimetype || '';
                mediaType = msgType;
            }
        }

        if (!mediaMessage) {
            return conn.sendMessage(chat, {
                text: "🖤 *𝐌𝐢𝐬𝐚 𝐁𝐎𝐓* 🖤\n\n› 📝 *Uso:* Responde a imagen o video con `.s`"
            }, { quoted: m });
        }

        await conn.sendMessage(chat, { react: { text: "⏳", key: m.key } });

        const { key: statusKey } = await conn.sendMessage(chat, {
            text: "⛓️ *𝐏𝐫𝐨𝐜𝐞𝐬𝐚𝐧𝐝𝐨...*"
        }, { quoted: m });

        try {
            // 2. Lógica de Recorte Automático
            let notice = "🦇 *𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐋𝐢𝐬𝐭𝐨*";
            if (/video/.test(mediaMime) && mediaMessage?.seconds > 12) {
                notice = "⚠️ *Video largo:* Se recortó a los primeros 12s.";
                await conn.sendMessage(chat, { text: "✂️ *𝐑𝐞𝐜𝐨𝐫𝐭𝐚𝐧𝐝𝐨 𝐯𝐢𝐝𝐞𝐨 a 12s...*", edit: statusKey });
            }

            // 3. Descarga Directa
            let dlType = /video/.test(mediaMime) ? 'video' : (/webp/.test(mediaMime) ? 'sticker' : 'image');
            const stream = await downloadContentFromMessage(mediaMessage, dlType);
            let chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);

            // 4. Creación con Recorte (FFmpeg debe estar instalado en tu Termux/VPS)
            const sticker = new Sticker(buffer, {
                pack: '𝐌𝐢𝐬𝐚 𝐁𝐎𝐓 🖤',
                author: 'Yanniel',
                type: StickerTypes.FULL,
                quality: 50, // Bajamos un poco calidad en videos para que carguen rápido
                fps: 15,
                startTime: '00:00:00',
                endTime: '00:00:12' // Aquí sucede la magia del recorte
            });

            const stickerBuffer = await sticker.toBuffer();

            // 5. Envío Final
            await conn.sendMessage(chat, { sticker: stickerBuffer }, { quoted: m });
            await conn.sendMessage(chat, { react: { text: "✅", key: m.key } });
            await conn.sendMessage(chat, { text: notice, edit: statusKey });

        } catch (e) {
            console.error(e);
            await conn.sendMessage(chat, { react: { text: "❌", key: m.key } });
            await conn.sendMessage(chat, { text: "❌ *𝐅𝐀𝐋𝐋𝐎 𝐂𝐑𝐈𝐓𝐈𝐂𝐎*", edit: statusKey });
        }
    }
};

export default stickerCommand;
