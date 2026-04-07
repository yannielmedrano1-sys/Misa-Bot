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

        if (!mediaMessage) return; // Ni responde si no hay nada que convertir

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

                await new Promise((resolve) => {
                    ffmpeg(tempInput)
                        .inputOptions(['-t 7']) // 7 segundos para que vuele
                        .outputOptions([
                            '-vcodec libwebp',
                            '-vf scale=512:512:force_original_aspect_ratio=increase,fps=12,crop=512:512',
                            '-lossless 0',
                            '-q:v 40',
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
                        .on('error', () => resolve()) // Fallback silencioso
                        .save(tempOutput);
                });
            }

            const sticker = new Sticker(finalBuffer, {
                pack: '𝓜𝓲𝓼α 𝘽𝙊𝙏 🖤',
                author: 'Yanniel',
                type: StickerTypes.FULL,
                quality: 100
            });

            await conn.sendMessage(from, { sticker: await sticker.toBuffer() }, { quoted: m });

        } catch (e) {
            console.error("Error rápido:", e);
        }
    }
};

export default stickerCommand;
