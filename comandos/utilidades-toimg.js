import fs from 'fs';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

// Funciones de conversión usando EzGif
async function webp2mp4(source) {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', source, 'image.webp');  
    let res = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form });  
    let html = await res.text();
    const $ = cheerio.load(html);
    let form2 = new FormData();
    let obj = {};  
    $('form input[name]').each((i, input) => {
        const name = $(input).attr('name');
        const value = $(input).val();
        obj[name] = value;
        form2.append(name, value);
    });
    let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, { method: 'POST', body: form2 });  
    let html2 = await res2.text();
    const $2 = cheerio.load(html2);
    const videoUrl = new URL($2('div#output > p.outfile > video > source').attr('src'), res2.url).toString();  
    let videoRes = await fetch(videoUrl);
    let videoBuffer = await videoRes.buffer();
    return videoBuffer;
}

async function webp2png(source) {
    let form = new FormData();
    let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
    form.append('new-image-url', isUrl ? source : '');
    form.append('new-image', source, 'image.webp');  
    let res = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form });  
    let html = await res.text();
    const $ = cheerio.load(html);
    let form2 = new FormData();
    let obj = {};  
    $('form input[name]').each((i, input) => {
        const name = $(input).attr('name');
        const value = $(input).val();
        obj[name] = value;
        form2.append(name, value);
    });
    let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, { method: 'POST', body: form2 });  
    let html2 = await res2.text();
    const $2 = cheerio.load(html2);
    const imgUrl = new URL($2('div#output > p.outfile > img').attr('src'), res2.url).toString();  
    let imgRes = await fetch(imgUrl);
    let imgBuffer = await imgRes.buffer();
    return imgBuffer;
}

const toImageMisa = {
    name: 'toimg',
    alias: ['toimage', 'tovideo', 'tomp4'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, command }) => {
        const chat = m.key.remoteJid;
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!/webp/.test(mime)) return conn.sendMessage(chat, { 
            text: `> ✐  *Debes citar un sticker para convertirlo a imagen o video.* ✧` 
        }, { quoted: m });

        try {
            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } });

            const buffer = await q.download();
            if (!buffer) throw new Error('No se pudo descargar el sticker');

            const isAnimated = q.isAnimated || (q.msg && q.msg.isAnimated);

            if (isAnimated) {
                // Conversión a MP4 (GIF)
                const mp4Buffer = await webp2mp4(buffer);
                const caption = `
ʚ 𝓜𝓲𝓼𝓪 𝓒𝓸𝓷𝓿𝓮𝓻𝓽𝓮𝓻 ɞ
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
                // Conversión a PNG
                const pngBuffer = await webp2png(buffer);
                const caption = `
ʚ 𝓜𝓲𝓼𝓪 𝓒𝓸𝓷𝓿𝓮𝓻𝓽𝓮𝓻 ɞ
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
            console.error("ERROR EN TOIMG 𝓜𝓲𝓼𝓪:", e);
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `> ✐  *Error al convertir el sticker.*\n> [Error: *${e.message}*]` 
            }, { quoted: m });
        }
    }
}

export default toImageMisa;
