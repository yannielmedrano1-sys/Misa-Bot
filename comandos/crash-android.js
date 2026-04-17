import fs from 'fs'
import path from 'path'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools', // Usa 'tools' para que el bot lo registre bajo tu categoría principal
    noPrefix: true,

    run: async (conn, m, { args, command, text }) => {
        // 1. Verificación inmediata
        if (!args[0]) {
            return conn.sendMessage(m.chat, { 
                text: `✧ ‧₊˚ *MISA CRASH* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: ${command} [número]\n> ✐ *Ejemplo:* ${command} 1809xxxxxxx` 
            }, { quoted: m })
        }

        try {
            // 2. Localizar el archivo en tu carpeta /travas/
            const travaRuta = path.join(process.cwd(), 'travas', 'ola.js')

            if (!fs.existsSync(travaRuta)) {
                return m.reply('❌ *Error:* No encontré el archivo `ola.js` en la carpeta `travas`.')
            }

            // 3. Leer el contenido (tu texto de unicodes)
            const contenido = fs.readFileSync(travaRuta, 'utf-8')

            // 4. Limpiar el JID del objetivo
            const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

            // 5. Reacción y envío
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })
            
            await conn.sendMessage(target, { text: contenido })

            // 6. Confirmación de salida
            await m.reply(`✅ *Enviado con éxito a @${args[0].replace(/[^0-9]/g, '')}*`)

        } catch (err) {
            console.error('Error en Crash Misa:', err)
        }
    }
}

// ESTO ES VITAL: Tu bot usa export default para cargar el objeto completo
export default crashAndroidMisa
