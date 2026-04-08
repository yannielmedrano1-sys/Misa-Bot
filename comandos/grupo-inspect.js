import { getUrlFromDirectPath } from "@whiskeysockets/baileys"

const inspectMisaFinal = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        if (!text) return conn.sendMessage(chat, { text: `> ✐  *Por favor, ingrese el enlace de un grupo, comunidad o canal.* ✧` }, { quoted: m })

        const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
        const settings = global.db.data?.settings?.[conn.user.id.split(':')[0] + '@s.whatsapp.net']
        let thumb = settings?.icon || 'https://qu.ax/ZpYm.jpg' 
        let pp, info, res, inviteInfo, inviteCode

        // --- LÓGICA DE FORMATEO NATIVO (REEMPLAZA A LODASH) ---
        const formatKey = (key) => {
            return key.replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .replace("Id", "🆔 ID")
                .replace("Name", "🏷️ Nombre")
                .replace("Subscribers", "👥 Suscriptores")
        }

        const MetadataGroupInfo = async (res) => {
            pp = await conn.profilePictureUrl(res.id, 'image').catch(() => null)
            inviteCode = await conn.groupInviteCode(m.chat).catch(() => null)

            return `
ʚ 𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

🆔 *ID:* ${res.id || "---"}
👑 *Creado por:* ${res.owner ? `@${res.owner?.split("@")[0]}` : "---"}
🏷️ *Nombre:* ${res.subject || "---"}
👥 *Miembros:* ${res.size || "---"}
🎫 *Link:* ${res.inviteCode || inviteCode || "No disponible"}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()
        }

        try {
            res = text ? null : await conn.groupMetadata(m.chat)
            if (res) info = await MetadataGroupInfo(res)
        } catch {
            const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]      
            if (inviteUrl) {
                try {
                    inviteInfo = await conn.groupGetInviteInfo(inviteUrl)
                    info = `ʚ 𝐌𝐢𝐬𝐚 𝐈𝐧𝐯𝐢𝐭𝐞 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ\n⊹₊ ˚‧\n🆔 *ID:* ${inviteInfo.id}\n🏷️ *Nombre:* ${inviteInfo.subject}\n👥 *Miembros:* ${inviteInfo.size}\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()
                    pp = await conn.profilePictureUrl(inviteInfo.id, 'image').catch(() => null)
                } catch (e) {
                    return conn.sendMessage(chat, { text: '> ✐  *Error:* Enlace no válido.' }, { quoted: m })
                }
            }
        }

        if (info) {
            await conn.sendMessage(chat, { 
                text: info, 
                contextInfo: {
                    externalAdReply: {
                        title: "𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫",
                        thumbnailUrl: pp || thumb,
                        mediaType: 1
                    }
                }
            }, { quoted: m })
        } else if (channelUrl) {
            try {
                let newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(() => null)
                if (!newsletterInfo) return conn.sendMessage(chat, { text: "> ✐  *No se encontró el canal.*" }, { quoted: m })
                
                let caption = `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ\n⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n\n`
                caption += `> ✰ *${formatKey('name')}:* ${newsletterInfo.name}\n`
                caption += `> ✰ *${formatKey('id')}:* ${newsletterInfo.id}\n`
                caption += `> ✰ *${formatKey('subscribers')}:* ${newsletterInfo.subscribers || '0'}\n`
                caption += `\n> Powered by 𝓜𝓲𝓼𝓪 ♡`

                pp = newsletterInfo?.preview ? getUrlFromDirectPath(newsletterInfo.preview) : thumb

                await conn.sendMessage(chat, { 
                    text: caption, 
                    contextInfo: {
                        externalAdReply: {
                            title: "𝐌𝐢𝐬𝐚 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫",
                            thumbnailUrl: pp,
                            mediaType: 1
                        }
                    }
                }, { quoted: m })
            } catch (e) {
                await conn.sendMessage(chat, { text: `> ✐  *Error:* ${e.message}` }, { quoted: m })
            }
        }
    }
}

export default inspectMisaFinal
