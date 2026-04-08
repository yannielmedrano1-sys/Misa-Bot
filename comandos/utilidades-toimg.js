import fetch from 'node-fetch';
import FormData from 'form-data';
import * as cheerio from 'cheerio';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

/**
 * Misa-Bot - Conversor de Stickers para Yanniel
 * Optimizada para la estructura del repositorio Misa-Bot
 */

// --- FUNCIONES DE CONVERSIÓN (EzGif Scraper) ---

async function webp2mp4(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    let res = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("EzGif MP4 Error");
    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to MP4!');
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    let videoUrl = 'https:' + $2('div#output > p.outfile > video > source').attr('src');
    return await (await fetch(videoUrl)).buffer();
}

async function webp2png(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    let res = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("EzGif PNG Error");
    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to PNG!');
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    let imgUrl = 'https:' + $2('div#output > p.outfile > img').attr('src');
    return await (await fetch(imgUrl)).buffer();
}

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid;

        // --- DETECTOR DE STICKER FORZADO ---
        // Buscamos en el mensaje citado o en el actual
        let quoted = m.quoted ? m.quoted : (m.msg?.contextInfo?.quotedMessage ? { message: m.msg.contextInfo.quotedMessage } : null);
        
        // Extraemos el contenido real del stickerMessage del JSON profundo
        let stickerMsg = quoted?.message?.stickerMessage || m.message?.stickerMessage || quoted?.stickerMessage;
        
        // Log de depuración para tu consola en Sky Ultra
        console.log("--- DEBUG REPO MISA ---");
        console.log("Sticker detectado:", !!stickerMsg);

        if (!stickerMsg) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa no detecta el sticker.* ✧\n> *Asegúrate de responder directamente a un sticker con "toimg".*` 
            }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } });

            // DESCARGA: Reconstruimos el objeto para que downloadMediaMessage no falle
            const buffer = await downloadMediaMessage(
                { message: m.quoted ? m.quoted.message : m.message },
                'buffer',
                {},
                { reuploadRequest: conn.updateMediaMessage }
            );

            if (!buffer) throw new Error("No se pudo generar el buffer");

            const isAnimated = stickerMsg.isAnimated || false;

            if (isAnimated) {
                const mp4Buffer = await webp2mp4(buffer);
                await conn.sendMessage(chat, { 
                    video: mp4Buffer, 
                    caption: `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ\n> Sticker Animado ➔ Video ✧`, 
                    gifPlayback: true 
                }, { quoted: m });
            } else {
                const pngBuffer = await webp2png(buffer);
                await conn.sendMessage(chat, { 
                    image: pngBuffer, 
                    caption: `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ\n> Sticker Estático ➔ Imagen ✧` 
                }, { quoted: m });
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("ERROR EN COMANDO TOIMG:", e);
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error de conversión:* ${e.message}` 
            }, { quoted: m });
        }
    }
};

export default toImageMisa;
