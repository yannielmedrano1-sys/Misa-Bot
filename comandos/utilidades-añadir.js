/* * 👑 Force Add System para Misa-Bot
 * Une al usuario o envía link si hay candado de privacidad.
 * Autor: Yanniel & Gemini
 */

const addCommand = {
    name: 'agregar',
    alias: ['añadir', 'add'],
    category: 'group',
    noPrefix: true,

    run: async (conn, m, { args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        const reply = (txt) => conn.sendMessage(chat, { text: txt }, { quoted: m })

        // 1. Validar argumentos
        if (args.length < 2) {
            return reply(`✧ ‧₊˚ *ADD SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n> ✐ *Faltan datos.*\n\n✰ \`Uso\`: *${command} número link*\n› *Ejemplo:* \`${command} 54911xxxx https://chat.whatsapp.com/xxx\``)
        }

        let num = args[0].replace(/[^0-9]/g, '')
        let inviteLink = args[1]
        const userJid = num + '@s.whatsapp.net'

        // Extraer código del link
        let groupCode = inviteLink.split('https://chat.whatsapp.com/')[1]
        if (!groupCode) return reply('> ✐ \`Error:\` El enlace no es un link de grupo válido.')

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. Obtener JID del grupo y refrescar Metadata (Clave para que detecte Admin)
            const groupInfo = await conn.groupGetInviteInfo(groupCode)
            const groupJid = groupInfo.id

            // Forzar actualización de participantes para asegurar que el bot sepa que es Admin
            const metadata = await conn.groupMetadata(groupJid).catch(() => null)
            if (!metadata) return reply('> ✐ No pude acceder a la información del grupo. ¿El bot está dentro?')

            // 3. INTENTAR AGREGAR (EL EMPUJÓN)
            const response = await conn.groupParticipantsUpdate(groupJid, [userJid], 'add')

            // Verificamos el estado de la respuesta
            const result = response[0]

            if (result.status === '200') {
                await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
                return reply(`✨ *¡@${num} ha sido unido directamente!*`)
            } 
            
            // 4. FALLBACK: PRIVACIDAD O ERROR (Status 403, 408, 409, etc.)
            await conn.sendMessage(chat, { react: { text: '📩', key: m.key } })

            const msgInvite = `✧ ‧₊˚ *INVITACIÓN A GRUPO* ୧ֹ˖ ⑅ ࣪⊹\n⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n\n✰ \`Hola!\`: Te intentaron agregar al grupo *${metadata.subject}*.\n\n   › 🔗 \`Link:\`: ${inviteLink}\n\n> *Toca el botón para unirte manualmente.*\n> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(userJid, { 
                text: msgInvite,
                contextInfo: {
                    externalAdReply: {
                        title: 'INVITACIÓN PENDIENTE 🖤',
                        body: `Grupo: ${metadata.subject}`,
                        thumbnailUrl: await conn.profilePictureUrl(groupJid, 'image').catch(() => 'https://i.imgur.com/8N76999.png'),
                        sourceUrl: inviteLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            })

            return reply(`⚠️ *Privacidad detectada:* No pude forzar la entrada de @${num}, pero ya le envié el link por privado.`)

        } catch (err) {
            console.error('Error en Force Add:', err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ \`Error:\` Asegúrate de que el bot sea *Admin* en el grupo del link.`)
        }
    }
}

export default addCommand
