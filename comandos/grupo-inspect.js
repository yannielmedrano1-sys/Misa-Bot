const inspectMisaGroups = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar', 'groupinfo'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, args }) => {
        const chat = m.key.remoteJid
        const groupInvite = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
        
        // Imagen por defecto desde tus ajustes o una fija de Misa
        const settings = global.db?.data?.settings?.[conn.user.id.split(':')[0] + '@s.whatsapp.net']
        let thumb = settings?.icon || 'https://qu.ax/ZpYm.jpg' 
        
        try {
            await conn.sendMessage(chat, { react: { text: '🔍', key: m.key } })

            let metadata
            let pp

            if (groupInvite) {
                // CASO 1: Inspeccionar grupo externo por LINK
                metadata = await conn.groupGetInviteInfo(groupInvite)
                pp = await conn.profilePictureUrl(metadata.id, 'image').catch(() => null)
            } else {
                // CASO 2: Inspeccionar el grupo ACTUAL (donde se usa el comando)
                if (!m.isGroup) return conn.sendMessage(chat, { text: "> ✐  *Este comando solo funciona en grupos o con un link de invitación.* ✧" }, { quoted: m })
                metadata = await conn.groupMetadata(chat)
                pp = await conn.profilePictureUrl(chat, 'image').catch(() => null)
            }

            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Nombre:* ${metadata.subject}
   > 🆔 *ID:* ${metadata.id}
   > 👑 *Creador:* ${metadata.owner ? `@${metadata.owner.split('@')[0]}` : 'Desconocido'}
   > 👥 *Miembros:* ${metadata.size || '---'}
   > 📅 *Creado:* ${metadata.creation ? new Date(metadata.creation * 1000).toLocaleDateString() : '---'}

✨ *Configuración* ✨
> 📢 *Solo Admins:* ${metadata.announce ? 'Si ✅' : 'No ❌'}
> ✏️ *Editar Info:* ${metadata.restrict ? 'Solo Admins 🔐' : 'Todos 🔓'}
> 🤝 *Aprobación:* ${metadata.joinApprovalMode ? 'Activada 🛡️' : 'Desactivada 🔓'}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { 
                text: caption, 
                contextInfo: { 
                    mentionedJid: [metadata.owner],
                    externalAdReply: { 
                        title: "𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫", 
                        body: "Análisis de grupo completado ✧", 
                        thumbnailUrl: pp || thumb, 
                        mediaType: 1,
                        showAdAttribution: true
                    } 
                } 
            }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("Error Inspect:", e)
            await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            return conn.sendMessage(chat, { 
                text: `> ✐  *Error:* No pude obtener la información.\n> *Nota:* Asegúrate de que el link sea válido o que yo esté en el grupo.` 
            }, { quoted: m })
        }
    }
}

export default inspectMisaGroups
