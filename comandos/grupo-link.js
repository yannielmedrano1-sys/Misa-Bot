// BY ABRAHAN-M

const linkCommand = {
    name: 'link',
    alias: ['grouplink', 'invitelink'],
    category: 'grupo',
    noPrefix: true,
    isOwner: false,
    isAdmin: false,
    isGroup: true,
    botAdmin: true,

    run: async (conn, m) => {
        const chat = m.key.remoteJid

        // 🔥 FIX DEL ERROR
        const sender = m.sender || m.key.participant || m.key.remoteJid
        const user = sender.split('@')[0]

        try {
            const code = await conn.groupInviteCode(chat)
            const link = `https://chat.whatsapp.com/${code}`

            const teks = `🔗 *ENLACE DEL GRUPO*

📌 Aquí tienes el link del grupo

👤 Solicitado por: @${user}

🌐 Link:
${link}`

            await conn.sendMessage(chat, {
                text: teks,
                mentions: [sender]
            }, { quoted: m })

        } catch (e) {
            console.error(e)

            await conn.sendMessage(chat, {
                text: `❌ *Error al obtener el link*\n\n📌 ${e.message}`
            }, { quoted: m })
        }
    }
}

export default linkCommand
