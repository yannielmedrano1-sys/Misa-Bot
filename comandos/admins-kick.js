/* MISA BOT - MODERATION SYSTEM 
   Comando: Kick / Expulsar
*/

const kickCommand = {
    name: 'kick',
    alias: ['ban', 'remove', 'eliminar', 'sacar'],
    category: 'admin',
    isAdmin: true,  // Solo admins del grupo pueden usarlo
    botAdmin: true, // El bot necesita ser admin para ejecutarlo
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const participants = groupMetadata.participants;

            // Validar si hay alguien mencionado o citado
            if (!m.mentionedJid[0] && !m.quoted) {
                return m.reply(`✧ ‧₊˚ *MISA MODERACIÓN* ୧ֹ˖\n\n✰ \`Uso\`: ${usedPrefix}${commandName} [@tag/reply]`);
            }

            // Identificar a la víctima
            let victim = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
            
            // Limpiar ID del bot (usando el método seguro)
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const ownerGroup = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
            const participant = participants.find((p) => p.id === victim);

            if (!participant) return m.reply("❌ El usuario no está en este grupo.");

            // Validaciones de seguridad
            if (victim === botId) {
                return m.reply(`✧ ‧₊˚ No puedo eliminarme a mí mismo del grupo.`);
            }

            if (victim === ownerGroup) {
                return m.reply(`✧ ‧₊˚ No se puede expulsar al creador del grupo.`);
            }

            // Comprobar si la víctima es admin
            if (participant.admin || participant.isSuperAdmin) {
                return m.reply(`✧ ‧₊˚ *ACCIÓN DENEGADA* ୧ֹ˖\n\nNo tengo permitido eliminar a otros Administradores.`, null, { mentions: [victim] });
            }

            // Ejecución de la expulsión
            await conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *SISTEMA DE MODERACIÓN* ୧ֹ˖\n\nEl usuario @${victim.split('@')[0]} ha sido seleccionado para ser expulsado.\n\n> Motivo: Decisión administrativa.`,
                mentions: [victim]
            }, { quoted: m });
            
            // Pequeña pausa para que se lea el mensaje antes del kick
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await conn.groupParticipantsUpdate(m.chat, [victim], 'remove');

        } catch (e) {
            console.error(e);
            return m.reply(`✧ ‧₊˚ *FALLO EN EL SISTEMA* ୧ֹ˖\n\nNo pude completar la expulsión. Asegúrate de que soy administrador.`);
        }
    }
};

export default kickCommand;
