import fetch from 'node-fetch';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

// --- FUNCIONES DE APOYO (EzGif Scraper) ---

async function webp2mp4(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    let res = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("Error en el servidor de EzGif (MP4)");

    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to MP4!');
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    let videoUrl = 'https:' + $2('div#output > p.outfile > video > source').attr('src');
    let videoRes = await fetch(videoUrl);
    return await videoRes.buffer();
}

async function webp2png(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    let res = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("Error en el servidor de EzGif (PNG)");

    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to PNG!');
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    let imgUrl = 'https:' + $2('div#output > p.outfile > img').attr('src');
    let imgRes = await fetch(imgUrl);
    return await imgRes.buffer();
}

// --- COMANDO PRINCIPAL ---

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid;
        
        // 1. DETECTOR DE STICKER (Mantenemos la búsqueda profunda)
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || (m.quoted?.message?.stickerMessage?.mimetype) || '';
        let isSticker = q.stickerMessage || m.quoted?.message?.stickerMessage;

        if (!isSticker && !/webp/.test(mime)) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Misa no detecta el sticker.* ✧\n> *Asegúrate de responder directamente a un sticker.*` 
            }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } });

            // 2. DESCARGA
            let buffer = await q.download?.().catch(() => null) || 
                         await conn.downloadMediaMessage(q).catch(() => null);

            if (!buffer) throw new Error("No se pudo descargar el archivo");

            const isAnimated = q.isAnimated || q.msg?.isAnimated || isSticker?.isAnimated;

            if (isAnimated) {
                // Sticker Animado -> Video
                const mp4Buffer = await webp2mp4(buffer);
                await conn.sendMessage(chat, { 
                    video: mp4Buffer, 
                    caption: `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ\n> Sticker Animado ➔ Video ✧`, 
                    gifPlayback: true 
                }, { quoted: m });
            } else {
                // Sticker Estático -> Imagen
                const pngBuffer = await webp2png(buffer);
                await conn.sendMessage(chat, { 
                    image: pngBuffer, 
                    caption: `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ\n> Sticker Estático ➔ Imagen ✧` 
                }, { quoted: m });
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("ERROR TOIMG:", e);
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } });
            await conn.sendMessage(chat, { text: `> ✐  *Error:* No pude completar la conversión. Intenta de nuevo.` }, { quoted: m });
        }
    }
};

// --- EL EXPORT QUE NO PUEDE FALTAR ---
export default toImageMisa;
