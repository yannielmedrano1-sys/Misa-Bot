import { getUrlFromDirectPath } from "@whiskeysockets/baileys"
import _ from "lodash"

const inspectMisa = {
    name: 'inspect',
    alias: ['inspeccionar', 'revisar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { text, args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        if (!text) return conn.sendMessage(chat, { text: `> ✐  *Por favor, ingrese el enlace de un grupo, comunidad o canal.* ✧` }, { quoted: m })

        const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
        const settings = global.db.data.settings[conn.user.id.split(':')[0] + '@s.whatsapp.net']
        let thumb = settings?.icon || 'https://qu.ax/ZpYm.jpg' 
        let pp, info, res, inviteInfo, inviteCode

        // --- FUNCIONES INTERNAS DE FORMATEO ---
        const formatParticipants = (participants) => participants && participants.length > 0 
            ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (superadmin)" : user.admin === "admin" ? " (admin)" : ""}`).join("\n") 
            : "No encontrado"

        const MetadataGroupInfo = async (res) => {
            let nameCommunity = ""
            if (res.linkedParent) {
                let linkedGroupMeta = await conn.groupMetadata(res.linkedParent).catch(() => null)
                nameCommunity = linkedGroupMeta ? "`Nombre:` " + linkedGroupMeta.subject : ""
            }
            pp = await conn.profilePictureUrl(res.id, 'image').catch(() => null)
            inviteCode = await conn.groupInviteCode(m.chat).catch(() => null)

            return `
ʚ 𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

🆔 *ID:* ${res.id || "---"}
👑 *Creado por:* ${res.owner ? `@${res.owner?.split("@")[0]}` : "---"} ${res.creation ? `el ${formatDate(res.creation)}` : ""}
🏷️ *Nombre:* ${res.subject || "---"}
📄 *Descripción:* ${res.desc || "Sin descripción"}
🎫 *Link:* ${res.inviteCode || inviteCode || "No disponible"}
👥 *Miembros:* ${res.size || "---"}

✨ *Información Avanzada* ✨
> 🔎 *Comunidad:* ${res.linkedParent ? "ID: " + res.linkedParent + (nameCommunity ? "\n" + nameCommunity : "") : res.isCommunity ? "Es una comunidad ✅" : "No vinculada"}
> 📢 *Anuncios:* ${res.announce ? "Si ✅" : "No ❌"}
> 🤝 *Aprobación:* ${res.joinApprovalMode ? "Si ✅" : "No ❌"}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()
        }

        // --- LÓGICA PRINCIPAL ---
        try {
            // Intentar obtener info del chat actual si no hay texto o es comando directo
            res = text ? null : await conn.groupMetadata(m.chat)
            if (res) info = await MetadataGroupInfo(res)
        } catch {
            const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]      
            if (inviteUrl) {
                try {
                    inviteInfo = await conn.groupGetInviteInfo(inviteUrl)
                    // Reutilizamos el formateo simplificado para invitados
                    info = `
ʚ 𝐌𝐢𝐬𝐚 𝐈𝐧𝐯𝐢𝐭𝐞 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

🆔 *ID:* ${inviteInfo.id}
🏷️ *Nombre:* ${inviteInfo.subject}
📄 *Descripción:* ${inviteInfo.desc || "Sin descripción"}
👥 *Miembros:* ${inviteInfo.size}
👑 *Dueño:* ${inviteInfo.owner ? `@${inviteInfo.owner.split('@')[0]}` : 'Desconocido'}

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()
                    pp = await conn.profilePictureUrl(inviteInfo.id, 'image').catch(() => null)
                } catch (e) {
                    return conn.sendMessage(chat, { text: '> ✐  *Error:* Grupo no encontrado o enlace expirado.' }, { quoted: m })
                }
            }
        }

        if (info) {
            const mentions = (res?.participants || inviteInfo?.participants || []).map(p => p.id)
            await conn.sendMessage(chat, { 
                text: info, 
                contextInfo: {
                    mentionedJid: mentions,
                    externalAdReply: {
                        title: "𝐌𝐢𝐬𝐚 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫",
                        body: "Análisis de grupo completado ✧",
                        thumbnailUrl: pp || thumb,
                        sourceUrl: text || "",
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m })
        } else {
            // Lógica para Canales (Newsletter)
            if (!channelUrl) return conn.sendMessage(chat, { text: "> ✐  *Verifique que sea un enlace válido de Grupo o Canal.*" }, { quoted: m })
            try {
                let newsletterInfo = await conn.newsletterMetadata("invite", channelUrl).catch(() => null)
                if (!newsletterInfo) return conn.sendMessage(chat, { text: "> ✐  *No se encontró información del canal.*" }, { quoted: m })
                
                let caption = `ʚ 𝐌𝐢𝐬𝐚 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐈𝐧𝐬𝐩𝐞𝐜𝐭 ɞ\n⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹\n\n` + processObject(newsletterInfo, "", newsletterInfo?.preview) + `\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`
                pp = newsletterInfo?.preview ? getUrlFromDirectPath(newsletterInfo.preview) : thumb

                await conn.sendMessage(chat, { 
                    text: caption, 
                    contextInfo: {
                        externalAdReply: {
                            title: "𝐌𝐢𝐬𝐚 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 𝐈𝐧𝐬𝐩𝐞𝐜𝐭𝐨𝐫",
                            body: "Datos del canal obtenidos ✧",
                            thumbnailUrl: pp,
                            sourceUrl: text,
                            mediaType: 1
                        }
                    }
                }, { quoted: m })
            } catch (e) {
                await conn.sendMessage(chat, { text: `> ✐  *Error inesperado:* ${e.message}` }, { quoted: m })
            }
        }
    }
}

// --- FUNCIONES DE APOYO (Mantienen tu lógica original de formateo) ---
function formatDate(n, locale = "es") {
    const date = new Date(n > 1e12 ? n : n * 1000)
    return isNaN(date) ? "Fecha no válida" : date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function newsletterKey(key) {
    return _.startCase(key.replace(/_/g, " "))
        .replace("Id", "🆔 ID")
        .replace("State", "📌 Estado")
        .replace("Name", "🏷️ Nombre")
        .replace("Description", "📜 Descripción")
        .replace("Subscribers", "👥 Suscriptores")
}

function processObject(obj, prefix = "", preview) {
    let caption = ""
    Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === "object" && value !== null) {
            if (Object.keys(value).length > 0) {
                caption += processObject(value, `${prefix}${key}_`, preview)
            }
        } else {
            const shortKey = prefix ? prefix.split("_").pop() + "_" + key : key
            const translatedKey = newsletterKey(shortKey)
            // Solo agregamos las keys más importantes para no saturar
            if (["name", "id", "subscribers", "description", "state"].includes(key)) {
                caption += `> ✰ *${translatedKey}:* ${value || "---"}\n`
            }
        }
    })
    return caption
}

export default inspectMisa
