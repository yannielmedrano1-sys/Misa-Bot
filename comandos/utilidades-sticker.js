/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/
import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const stickerCommand = {
    name: 's',
    alias: ['sticker', 'stiker'],
    category: 'tools',
    isOwner: false,
    noPrefix: true, 
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { from }) => {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let mediaMessage = null;
        let mediaType = '';

        if (quoted) {
            const quotedType = getContentType(quoted);
            if (/image|video|sticker/.test(quotedType)) {
                mediaMessage = quoted[quotedType];
                mediaType = quotedType;
            }
        } else {
            const msgType = getContentType(m.message);
            if (/image|video/.test(msgType)) {
                mediaMessage = m.message[msgType];
                mediaType = msgType;
            }
        }

        if (!mediaMessage) return;

        // 🛑 Error: Video demasiado largo
        if ((mediaType === 'videoMessage' || mediaMessage?.isAnimated) && mediaMessage?.seconds > 20) {
            return conn.sendMessage(from, { 
                text: "› ✐  *Error:* El video excede los 20 segundos. ✧" 
            }, { quoted: m });
        }

        try {
            const dlType = mediaType.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaMessage, dlType === 'sticker' ? 'sticker' : dlType);
            let chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            let buffer = Buffer.concat(chunks);

            const isVideo = /video/.test(mediaType) || (mediaType === 'stickerMessage' && mediaMessage.isAnimated);
            let finalBuffer = buffer;

            if (isVideo) {
                const tempInput = join(tmpdir(), `in_${Date.now()}.mp4`);
                const tempOutput = join(tmpdir(), `out_${Date.now()}.webp`);
                fs.writeFileSync(tempInput, buffer);

                await new Promise((resolve, reject) => {
                    ffmpeg(tempInput)
                        .inputOptions(['-t 8']) 
                        .outputOptions([
                            '-vcodec libwebp',
                            '-vf scale=512:512:force_original_aspect_ratio=increase,fps=10,crop=512:512',
                            '-lossless 0',
                            '-compression_level 6',
                            '-q:v 30',
                            '-loop 0',
                            '-an'
                        ])
                        .toFormat('webp')
                        .on('end', () => {
                            finalBuffer = fs.readFileSync(tempOutput);
                            fs.unlinkSync(tempInput);
                            fs.unlinkSync(tempOutput);
                            resolve();
                        })
                        .on('error', (err) => {
                            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                            reject(err);
                        })
                        .save(tempOutput);
                });
            }

            const sticker = new Sticker(finalBuffer, {
                pack: '𝓜𝓲𝓼𝓪  𝘽𝙊𝙏 🖤',
                author: 'Yanniel',
                type: StickerTypes.FULL,
                quality: 80
            });

            const stickerBuffer = await sticker.toBuffer();
            
            // 🛑 Error: Peso excedido
            if (stickerBuffer.length > 1000000) {
                return conn.sendMessage(from, { 
                    text: "› ✐  *Error:* El archivo es demasiado pesado para procesar. ✧" 
                }, { quoted: m });
            }

            await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });

        } catch (e) {
            // 🛑 Error: Fallo genérico
            await conn.sendMessage(from, { 
                text: "› ✐  *Error:* No se pudo procesar el contenido multimedia. ✧" 
            }, { quoted: m });
        }
    }
};

export default stickerCommand;
