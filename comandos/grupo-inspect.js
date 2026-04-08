import { jidDecode } from '@whiskeysockets/baileys'

const inspectMisaFinal = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar', 'ginfo'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, args }) => {
        const chat = m.key.remoteJid
        
        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            let metadata
            let inviteCode = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]

            // 1. OBTENER LA DATA (POR LINK O POR GRUPO ACTUAL)
            if (inviteCode) {
                // Si mandas link, usamos la función de invitación
                metadata = await conn.groupGetInviteInfo(inviteCode).catch(() => null)
            } else if (m.isGroup) {
                // Si no hay link, inspeccionamos el grupo donde se puso el comando
                metadata = await conn.groupMetadata(chat).catch(() => null)
            }

            if (!metadata) {
                return conn.sendMessage(chat, { 
                    text: `> ✐  *Error:* No pude obtener información. Asegúrate de que el link sea válido o que yo esté en el grupo. ✧` 
                }, { quoted: m })
            }

            // 2. EXTRAER VARIABLES LIMPIAS
            const id = metadata.id
            const name = metadata.subject
            const size = metadata.size || metadata.participants?.length || '---'
            const owner = metadata.owner || metadata.subjectOwner || (metadata.participants?.find(p => p.admin === 'superadmin')?.id)
            const creation = metadata.creation ? new Date(metadata.creation * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'
            const desc = metadata.desc || 'Sin descripción disponible.'
            
            // Intentar sacar la foto de perfil
            let pp = await conn.profilePictureUrl(id, 'image').catch(() => 'https://qu.ax/ZpYm.jpg')

            // 3. DISEÑO ESTILO MISA
            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Nombre:* ${name}
   > 🆔 *ID:* ${id}
   > 👑 *Fundador:* ${owner ? `@${owner.split('@')[0]}` : 'Desconocido'}
   > 👥 *Miembros:* ${size}
   > 📅 *Creado:* ${creation}

📄 *Descripción:*
${desc}

✨ *Privacidad:*
> 🔒 *Admins:* ${metadata.announce ? 'Solo Admins' : 'Todos'}
> 🛡️ *Aprobación:* ${metadata.joinApprovalMode ? 'Activada' : 'Desactivada'}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            // 4. ENVÍO FINAL
            await conn.sendMessage(chat, {
                text: caption,
                contextInfo: {
                    mentionedJid: owner ? [owner] : [],
                    externalAdReply: {
                        title: "𝐌𝐢𝐬𝐚 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫 𝐕𝟐",
                        body: "Grupo analizado con éxito ✧",
                        thumbnailUrl: pp,
                        sourceUrl: text || `https://chat.whatsapp.com/${inviteCode || ''}`,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN INSPECT:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            return conn.sendMessage(chat, { 
                text: `> ✐  *Error crítico:* No se pudo procesar la solicitud en Sky Ultra. ✧` 
            }, { quoted: m })
        }
    }
}

export default inspectMisaFinal
