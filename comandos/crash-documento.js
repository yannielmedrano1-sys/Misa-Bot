/* * 👑 MISA CRASH-DOCUMENT (TRAVADOC)
 * Ruta: comandos/travadoc.js
 */

import fs from 'fs';
import path from 'path';

const crashDocMisa = {
    name: 'travadoc',
    alias: ['tdoc', 'crashdoc', 'doc'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        try {
            const chat = m.key.remoteJid;

            // 1. Validación de entrada
            if (!args[0]) {
                const textoUso = `✧ ‧₊˚ *MISA DOC-CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Carga:* travadoc.js`;
                return await conn.sendMessage(chat, { text: textoUso }, { quoted: m });
            }

            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 8) {
                return await conn.sendMessage(chat, { text: '❌ *Número inválido.*' }, { quoted: m });
            }
            const targetJid = `${num}@s.whatsapp.net`;

            // 2. Ruta exacta al archivo que mencionaste
            // Buscamos: /home/container/travas/travadoc.js
            const pathTrava = path.join(process.cwd(), 'travas', 'travadoc.js');
            
            if (!fs.existsSync(pathTrava)) {
                return await conn.sendMessage(chat, { 
                    text: `❌ *Error:* No encontré el archivo \`travadoc.js\` dentro de la carpeta \`travas/\` en tu GitHub.` 
                }, { quoted: m });
            }

            // 3. Leemos el archivo travadoc.js
            const contenidoTrava = fs.readFileSync(pathTrava);

            // Reacción de procesamiento
            await conn.sendMessage(chat, { react: { text: '📂', key: m.key } });

            // 4. ENVÍO DEL DOCUMENTO A @targetJid
            await conn.sendMessage(targetJid, {
                document: contenidoTrava,
                fileName: '💥 𝑻𝑹𝑨𝑽𝑨𝑫𝑶𝑪.𝒋𝒔 💥.txt', // Lo mandamos como .txt para que WA lo abra directo
                mimetype: 'text/plain',
                caption: '✧ ‧₊˚ 𝕸𝖎𝖘𝖆 𝕮𝖗𝖆𝖘𝖍 𝕾𝖞𝖘𝖙𝖊𝖒 ୧ֹ˖'
            });

            // Confirmación final
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `✅ *Documento 'travadoc.js' enviado a @${num}*`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('[ERROR TRAVADOC]:', err);
        }
    }
};

export default crashDocMisa;
