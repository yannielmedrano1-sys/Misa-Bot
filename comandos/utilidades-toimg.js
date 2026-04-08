import fetch from 'node-fetch';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

// --- FUNCIONES DE CONVERSIÓN OPTIMIZADAS ---

async function webp2mp4(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    
    // Paso 1: Subir el archivo
    let res = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("No se pudo procesar el archivo en EzGif (MP4)");

    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to MP4!');
    
    // Paso 2: Convertir
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    
    let videoUrl = 'https:' + $2('div#output > p.outfile > video > source').attr('src');
    if (!videoUrl || videoUrl.includes('undefined')) throw new Error("URL de video no encontrada");

    let videoRes = await fetch(videoUrl);
    return await videoRes.buffer();
}

async function webp2png(source) {
    let form = new FormData();
    form.append('new-image', source, 'image.webp');
    form.append('new-image-url', '');
    
    // Paso 1: Subir
    let res = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form });
    let html = await res.text();
    let $ = cheerio.load(html);
    
    let file = $('input[name="file"]').val();
    if (!file) throw new Error("No se pudo procesar el archivo en EzGif (PNG)");

    let form2 = new FormData();
    form2.append('file', file);
    form2.append('convert', 'Convert WebP to PNG!');
    
    // Paso 2: Convertir
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + file, { method: 'POST', body: form2 });
    let html2 = await res2.text();
    let $2 = cheerio.load(html2);
    
    let imgUrl = 'https:' + $2('div#output > p.outfile > img').attr('src');
    if (!imgUrl || imgUrl.includes('undefined')) throw new Error("URL de imagen no encontrada");

    let imgRes = await fetch(imgUrl);
    return await imgRes.buffer();
}

// --- COMANDO MISA BOT ---

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid;
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!/webp/.test(mime)) {
            return conn.sendMessage(chat, { 
                text: `> ✐  *Debes citar un sticker para convertirlo.* ✧` 
            }, { quoted: m });
        }

        try {
            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } });

            const buffer = await q.download();
            if (!buffer) throw new Error('Error al descargar el sticker desde WhatsApp');

            const isAnimated = q.isAnimated || (q.msg && q.msg.isAnimated);

            if (isAnimated) {
                // PROCESO MP4
                const mp4Buffer = await webp2mp4(buffer);
                const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Tipo:* Sticker Animado ➔ Video/Gif
   > ✿ *Estado:* ¡Conversión exitosa!

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

                await conn.sendMessage(chat, { 
                    video: mp4Buffer, 
                    caption: caption, 
                    gifPlayback: true 
                }, { quoted: m });

            } else {
                // PROCESO PNG
                const pngBuffer = await webp2png(buffer);
                const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐞𝐫 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Tipo:* Sticker Estático ➔ Imagen
   > ✿ *Estado:* ¡Conversión exitosa!

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim();

                await conn.sendMessage(chat, { 
                    image: pngBuffer, 
                    caption: caption 
                }, { quoted: m });
            }

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error("ERROR TOIMG MISA:", e);
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude convertir el sticker.\n> *Nota:* EzGif puede estar lento o el archivo es muy pesado.` 
            }, { quoted: m });
        }
    }
}

export default toImageMisa;
