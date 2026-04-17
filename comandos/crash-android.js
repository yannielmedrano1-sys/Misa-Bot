/* * 👑 MISA CRASH-SYSTEM - Bridge
 * Ruta: comandos/crash-android.js
 * Este comando lee el contenido de /travas/ola.js y lo envía.
 */

import fs from 'fs'
import path from 'path'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash'],
    category: 'travas',
    noPrefix: true,

    run: async (conn, m, { args, command }) => {
        // 1. Validar que se ingresó un número
        if (!args[0]) {
            return conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx` 
            }, { quoted: m })
        }

        try {
            // 2. Definir la ruta del archivo ola.js en la carpeta travas
            // Ajustamos la ruta para que suba un nivel y busque en /travas/
            const travaPath = path.join(process.cwd(), 'travas', 'ola.js')

            // 3. Verificar si el archivo existe
            if (!fs.existsSync(travaPath)) {
                return m.reply(`❌ No encontré el archivo 'ola.js' en la carpeta 'travas'.\nVerifica que la carpeta esté en la raíz de tu GitHub.`)
            }

            // 4. Leer el contenido del trava
            let travaContenido = fs.readFileSync(travaPath, 'utf-8')

            // Limpiamos el número del objetivo
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'

            // 5. Ejecución: Reacción y Envío
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

            // Enviamos el contenido de ola.js como texto
            await conn.sendMessage(targetJid, { text: travaContenido })

            // Confirmación en tu chat
            await conn.sendMessage(m.chat, { 
                text: `🚀 *¡Misión cumplida!*\n> Trava 'ola.js' enviado con éxito a @${targetNum}`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('Error en el Sistema de Travas:', err)
            m.reply('❌ Hubo un error al intentar leer o enviar el archivo.')
        }
    }
}

export default crashAndroidMisa
