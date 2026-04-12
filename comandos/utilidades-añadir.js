/* * 👑 Group Adder Force para Misa-Bot
 * Une al usuario directamente usando poder de Admin.
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

        // 1. Validar que tengamos Número y Link del grupo
        if (args.length < 2) {
            return reply(`✧ ‧₊˚ *FORCE ADD* ୧ֹ˖ ⑅ ࣪⊹\n\n> ✐ *Faltan datos.*\n\n✰ \`Uso\`: *${usedPrefix + command} número link*\n› *Ejemplo:* \`${usedPrefix + command} 54911xxxx https://chat.whatsapp.com/xxx\``)
        }

        let num = args[0].replace(/[^0-9]/g, '')
        let inviteLink = args[1]
        const userJid = num + '@s.whatsapp.net'

        // Extraer el ID del grupo a partir del link
        let groupCode = inviteLink.split('https://chat.whatsapp.com/')[1]
        if (!groupCode) return reply('> ✐ \`Error:\` El link del grupo no es válido.')

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. Obtener el JID del grupo usando el link
            const groupInfo = await conn.groupGetInviteInfo(groupCode)
            const groupJid = groupInfo.id

            if (!groupJid) return reply('> ✐ No pude encontrar el grupo con ese enlace.')

            // 3. INTENTAR UNIR DIRECTO (Acción de Admin)
            // Nota: El bot debe estar en el grupo y ser admin.
            const response = await conn.groupParticipantsUpdate(groupJid, [userJid], 'add')

            /* response[0].status:
               200 = Éxito total
               403 = Privacidad activada (No se puede forzar)
               408 = El usuario acaba de salir del grupo recientemente
            */
            
            if (response[0].status === 200) {
                await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
                return reply(`✨ *¡@${num} ha sido unido al grupo con éxito!*`)
            } 
            
            if (response[0].status === 403) {
                await conn.sendMessage(chat, { react: { text: '📩', key: m.key } })
                
                // 4. FALLBACK: Si no se puede por la fuerza, enviamos link al privado
                const msgInvite = `✧ ‧₊˚ *INVITACIÓN A GRUPO* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Hola!\`: Te intentaron agregar a un grupo, pero tu privacidad lo impidió.\n\n   › 🔗 \`Link:\`: ${inviteLink}\n\n> 𝓜𝓲𝓼𝓪 ♡`.trim()

                await conn.sendMessage(userJid, { 
                    text: msgInvite,
                    contextInfo: {
                        externalAdReply: {
                            title: 'INVITACIÓN PENDIENTE 🖤',
                            body: 'Toca para unirte',
                            thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png',
                            sourceUrl: inviteLink,
                            mediaType: 1
                        }
                    }
                })

                return reply(`⚠️ @${num} tiene su privacidad activa.\n> *Le envié el link al privado porque no pude meterlo a la fuerza.*`)
            }

            return reply(`> ✐ No se pudo agregar al usuario (Status: ${response[0].status})`)

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ \`Error:\` Asegúrate de que el bot sea *Admin* en ese grupo.`)
        }
    }
}

export default addCommand
