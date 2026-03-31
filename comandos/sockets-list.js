/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'bots',
    alias: ['sockets', 'subbots', 'nodos'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: true, 
    noPrefix: true, 

    run: async (conn, m) => {
        const from = m.chat;

        try {
            // 1. Obtener participantes del grupo de forma segura
            const groupMetadata = await conn.groupMetadata(from).catch(() => null);
            if (!groupMetadata) return; // Si no hay metadata, no responde para no dar error

            const participants = groupMetadata.participants.map(p => p.id);
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

            // 2. Escaneo de la carpeta de sesiones
            const sessionsPath = path.resolve('./sesiones_subbots');
            let sessionFolders = [];
            if (fs.existsSync(sessionsPath)) {
                sessionFolders = fs.readdirSync(sessionsPath).filter(f => {
                    return fs.statSync(path.join(sessionsPath, f)).isDirectory() && !f.startsWith('.');
                });
            }

            let mentionsJid = [];
            let listaFinal = "";
            let botsEncontrados = 0;

            // 3. LÓGICA DE PRIORIDAD: EL PRINCIPAL PRIMERO
            if (participants.includes(mainBotJid)) {
                mentionsJid.push(mainBotJid);
                listaFinal += `   *➪ @${mainBotJid.split('@')[0]}* » (Principal)\n`;
                botsEncontrados++;
            }

            // 4. LÓGICA DE SUBS: Escaneo por archivos
            sessionFolders.forEach(folder => {
                // Limpiamos el nombre de la carpeta para obtener solo el número
                const rawNumber = folder.replace(/\D/g, '');
                const subJid = `${rawNumber}@s.whatsapp.net`;

                // Si el sub-bot está en el grupo y no es el principal (para no repetir)
                if (participants.includes(subJid) && subJid !== mainBotJid) {
                    mentionsJid.push(subJid);
                    listaFinal += `   *➪ @${rawNumber}* » (Sub-Bot)\n`;
                    botsEncontrados++;
                }
            });

            // 5. Construcción del mensaje
            const texto = `
✿︎ \`LISTA DE SOCKETS ACTIVOS\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots Totales » ${sessionFolders.length}*

*⌨︎ Nodos en este grupo » ${botsEncontrados}*

${listaFinal || "_No se detectaron nodos de la red en este chat._"}
`.trim();

            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentionsJid,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Supervisión de Nodos Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en socket monitor (Filesystem Mode):', err);
        }
    }
};

export default listSocketsCommand;
