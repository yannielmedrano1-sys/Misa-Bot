/* MISA BOT - EVENT DETECTOR (LOGIC FIX)
   Lógica: Notificaciones de cambios en tiempo real (Admins, Nombre, Foto)
*/
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export const detectHandler = async (conn) => {
    // --- EVENTO: CAMBIOS EN PARTICIPANTES (ADMINS) ---
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action, author } = update;
            
            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[id]?.detect) return;

            for (let user of participants) {
                const phone = user.split('@')[0];
                const actor = author ? author.split('@')[0] : 'un Administrador';
                let aviso = '';

                if (action === 'promote') {
                    aviso = `✧ ‧₊˚ *MISA DETECTOR: ASCENSO* ୧ֹ˖\n\n✰ @${phone} ha sido promovido a *Administrador*.\n✰ Autor: @${actor}\n\n> ¡Felicidades por el nuevo cargo en el grupo!`;
                } else if (action === 'demote') {
                    aviso = `✧ ‧₊˚ *MISA DETECTOR: DEGRADO* ୧ֹ˖\n\n✰ @${phone} ha sido removido de su cargo.\n✰ Autor: @${actor}\n\n> El sistema ha actualizado los permisos.`;
                }

                if (aviso) {
                    await conn.sendMessage(id, { 
                        text: aviso, 
                        mentions: [user, author].filter(Boolean) 
                    });
                }
            }
        } catch (e) {
            console.error("[ERROR DETECT PARTICIPANTES]:", e);
        }
    });

    // --- EVENTO: CAMBIOS EN AJUSTES DEL GRUPO (NOMBRE/FOTO/DESCRIPCIÓN) ---
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.messageStubType) return;
            const chat = m.key.remoteJid;

            if (!fs.existsSync(databasePath)) return;
            const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            if (!db[chat]?.detect) return;

            const actor = m.key?.participant || m.participant || chat;
            const phone = actor.split('@')[0];
            let cambio = '';

            // Mapeo de StubTypes de Baileys (Eventos de sistema)
            if (m.messageStubType == 21) cambio = `cambió el nombre del grupo a:\n> *${m.messageStubParameters[0]}*`;
            if (m.messageStubType == 22) cambio = `actualizó la imagen de perfil del grupo.`;
            if (m.messageStubType == 24) cambio = `editó la descripción del grupo.`;
            if (m.messageStubType == 25) cambio = `cambió los permisos de edición a: *${m.messageStubParameters[0] == 'on' ? 'Solo Admins' : 'Todos'}*`;
            if (m.messageStubType == 26) cambio = `cerró el grupo. (Solo Admins pueden enviar mensajes)`;
            if (m.messageStubType == 27) cambio = `abrió el grupo. (Todos pueden enviar mensajes)`;

            if (cambio) {
                await conn.sendMessage(chat, { 
                    text: `✧ ‧₊˚ *MISA DETECTOR: AJUSTES* ୧ֹ˖\n\n✰ @${phone} ${cambio}\n\n> Cambio detectado y registrado.`,
                    mentions: [actor]
                });
            }
        } catch (e) {
            console.error("[ERROR DETECT STUB]:", e);
        }
    });
};

export default detectHandler;
