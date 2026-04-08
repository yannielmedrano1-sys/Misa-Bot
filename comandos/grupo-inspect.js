import { jidDecode } from '@whiskeysockets/baileys'

const inspectMisaFinal = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar', 'ginfo'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        const chat = m.key.remoteJid || m.chat
        
        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            let metadata
            // Expresión regular para detectar links de invitacion de WhatsApp
            let inviteCode = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]

            // 1. OBTENER LA DATA (POR LINK O POR GRUPO ACTUAL)
            if (inviteCode) {
                // Si el usuario mandó un link, pedimos info a los servidores de WA
                metadata = await conn.groupGetInviteInfo(inviteCode).catch(() => null)
            } else {
                // Si no mandó link, intentamos inspeccionar el grupo actual
                const isGroup = chat.endsWith('@g.us')
                if (isGroup) {
                    metadata = await conn.groupMetadata(chat).catch(() => null)
                }
            }

            if (!metadata) {
                await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return conn.sendMessage(chat, { 
                    text: `> ✐  *Error:* No pude obtener información. Asegúrate de que el link sea válido o que yo esté en el grupo. ✧` 
                }, { quoted: m })
            }

            // 2. EXTRAER VARIABLES LIMPIAS
            const id = metadata.id || '---'
            const name = metadata.subject || 'Sin nombre'
            const size = metadata.size || metadata.participants?.length || '---'
            
            // Buscamos al dueño (fundador)
            const owner = metadata.owner || metadata.subjectOwner || (metadata.participants?.find(p => p.admin === 'superadmin')?.id)
            
            // Formatear fecha de creación
            const creation = metadata.creation ? new Date(metadata.creation * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'
            
            // Descripción (limitada para no romper el chat)
            const desc = metadata.desc || 'Sin descripción disponible.'
            
            // Intentar sacar la foto de perfil del grupo
            let pp = await conn.profilePictureUrl(id, 'image').catch(() => 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg')

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

            // 4. ENVÍO CON ADREPLY (TARJETA VISUAL)
            await conn.sendMessage(chat, {
                text: caption,
                contextInfo: {
                    mentionedJid: owner ? [owner] : [],
                    externalAdReply: {
                        title: "𝐌𝐢𝐬𝐚 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫 𝐕𝟐 🖤",
                        body: "Análisis de grupo completado ✧",
                        thumbnailUrl: pp,
                        sourceUrl: inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : 'https://github.com/yannielmedrano1-sys/Misa-Bot',
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR EN INSPECT MISA:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            return conn.sendMessage(chat, { 
                text: `> ✐  *Error crítico:* No se pudo procesar la solicitud en Sky Ultra. ✧` 
            }, { quoted: m })
        }
    }
}

export default inspectMisaFinal
