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
} ♱ 🔗 ￣꯭̥ᷭ ིྀ⃟♱࣪ 𝐄ׁׅܻ݊𝐍ׁׅ𝐋ׁׅ֮𝐀ׁׅ𝐂ׁׅ֮𝐄ׁׅܻ݊ 𝐃ׁׅ֮𝐄ׁׅܻ݊𝐋ׁׅ֮ 𝐆ׁׅ֮𝐑ׁׅ֮𝐔ׁׅ֮𝐏ׁׅ֮𝐎ׁׅ֮ ￣꯭̥ᷭ ིྀ⃟♱࣪ ♱
📌 ☾ 𝐀ׁׅ𝐪ׁׅ֮𝐮ׁׅ֮𝐢ׁׅ֮ 𝐭ׁׅ𝐢ׁׅ𝐞ׁׅ𝐧ׁׅ𝐞ׁׅ𝐬ׁׅ֮ 𝐞ׁׅ𝐥ׁׅ֮ 𝐥ׁׅ𝐢ׁׅ𝐧ׁׅ𝐤ׁׅ֮ 𝐝ׁׅ𝐞ׁׅ𝐥ׁׅ֮ 𝐠ׁׅ𝐫ׁׅ𝐮ׁׅ𝐩ׁׅ𝐨ׁׅ֮ ☽
👤 𝐒ׁׅ𝐨ׁׅ𝐥ׁׅ𝐢ׁׅ𝐜ׁׅ𝐢ׁׅ𝐭ׁׅ𝐚ׁׅ𝐝ׁׅ𝐨ׁׅ֮ 𝐩ׁׅ𝐨ׁׅ𝐫ׁׅ֮: ✦ @⁨𝐘ׁׅ𝐚ׁׅ𝐧ׁׅ𝐧ׁׅ𝐢ׁׅ𝐞ׁׅ𝐥ׁׅ֮⁩ ✦
🌐 𖣊 𝐋ׁׅ𝐢ׁׅ𝐧ׁׅ𝐤ׁׅ֮: 𖣊
https://chat.whatsapp.com/H7BYRQT58pd1KGw6z7eN8y
𖥋 ☪︎ ☾ 𝐌ׁׅ𝐢ׁׅ𝐬ׁׅ𝐚ׁׅ 𝐆ׁׅ𝐨ׁׅ𝐭ׁׅ𝐢ׁׅ𝐜ׁׅ𝐚ׁׅ ☽ ☪︎ 𖥋

export default linkCommand
