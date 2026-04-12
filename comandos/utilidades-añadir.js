/* * 👑 Group Inviter Pro para Misa-Bot
 * Une al usuario directamente o envía link según privacidad.
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

        // 1. Validar que tengamos Número y Link
        if (args.length < 2) {
            return reply(`✧ ‧₊˚ *ADD SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n> ✐ *Faltan datos para procesar.*\n\n✰ \`Uso\`: *${usedPrefix + command} número link*\n› *Ejemplo:* \`${usedPrefix + command} 54911xxxx https://chat.whatsapp.com/xxx\``)
        }

        let num = args[0].replace(/[^0-9]/g, '')
        let inviteLink = args[1]
        const userJid = num + '@s.whatsapp.net'

        // Extraer el código del link (lo que va después de /)
        const code = inviteLink.split('https://chat.whatsapp.com/')[1]

        if (!code) {
            return reply('> ✐ \`Error:\` El link de invitación no es válido.')
        }

        try {
            await conn.sendMessage(chat, { react: { text: '⏳', key: m.key } })

            // 2. Lógica de Unión
            try {
                // El bot intenta unir al usuario usando el código de invitación
                await conn.groupAcceptInviteV4(userJid, code)
                
                await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })
                return reply(`✨ *¡@${num} ha sido agregado al grupo solicitado!*`)

            } catch (e) {
                // 3. Fallback: Si el método directo falla (privacidad), enviamos link
                await conn.sendMessage(chat, { react: { text: '📩', key: m.key } })

                const msgInvite = `✧ ‧₊˚ *INVITACIÓN A GRUPO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ \`Hola!\`: Te han invitado a unirte a un grupo.
   › 🔗 \`Link\`: ${inviteLink}

> *Haz clic en el enlace para entrar.*
> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

                await conn.sendMessage(userJid, { 
                    text: msgInvite,
                    contextInfo: {
                        externalAdReply: {
                            title: 'INVITACIÓN PENDIENTE 🖤',
                            body: 'Toca para unirte al grupo',
                            thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png', 
                            sourceUrl: inviteLink,
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                })

                return reply(`⚠️ @${num} tiene la privacidad activa.\n> *Se le ha enviado el link por mensaje privado.*`)
            }

        } catch (err) {
            console.error(err)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return reply(`> ✐ \`Error:\` No pude comunicarme con el número @${num}.`)
        }
    }
}

export default addCommand
