/* Código creado por Yanniel
por favor y no quites los créditos.
https://github.com/yannielmedrano1-sys
*/

import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda', 'menu'],
    category: 'main',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, pushName }) => {
        try {
            // Validación para evitar el "undefined" en el saludo
            const nombreUsuario = pushName || m.pushName || 'Usuario';
            
            // Obtener datos del sistema
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
            const baileysVersion = pkg.dependencies['@whiskeysockets/baileys']?.replace('^', '') || '6.6.0';
            const totalCommands = global.commands ? global.commands.size : '0';

            // Configuración de Hora y Fecha (Santo Domingo)
            const now = new Date();
            const hora = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santo_Domingo" });
            const fecha = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santo_Domingo" });

            const textoMenu = `Hola *${nombreUsuario}*, Soy 𝓜𝓲𝓼𝓪  𝘽𝙊𝙏
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

🖤 Prefix ⊹ \`${prefix}\`
✰ Owner ⊹ \`Yanniel\`
🖤 Libreria ⊹ \`Baileys v${baileysVersion}\`
✰ Hora ⊹ \`${hora}\`
🖤 Fecha ⊹ \`${fecha}\`
✰ Cmds ⊹ \`${totalCommands}\`

*˚.⋆ֹ　 ꒰ 𝙸 𝙽 𝙵 𝙾 – 𝙱 𝙾 𝚃 ꒱ㆍ₊⊹*
> ✐ Consulta el estado y la velocidad del sistema.

✿︎ ${prefix}p • ${prefix}ping
> ❀ Calcula la latencia real del bot.
✿︎ ${prefix}help • ${prefix}menu
> ❀ Despliega esta lista de comandos.
✿︎ ${prefix}botinfo • ${prefix}info
> ❀ Información detallada del sistema.

*˚.⋆ֹ　 ꒰ 𝙳 𝙾 𝚆 𝙽 𝙻 𝙾 𝙰 𝙳 𝙴 𝚁 𝚂 ꒱ㆍ₊⊹*
> ✐ Descarga contenido multimedia al instante.

✿︎ ${prefix}play • ${prefix}music • ${prefix}ytmp3
> ❀ Descarga música desde YouTube.
✿︎ ${prefix}play2 • ${prefix}video • ${prefix}vid
> ❀ Descarga videos desde YouTube.
✿︎ ${prefix}tiktok • ${prefix}tt • ${prefix}tts
> ❀ Descarga videos de TikTok (sin marca de agua).

*˚.⋆ֹ　 ꒰ 𝚂 𝚃 𝙸 𝙲 𝙺 𝙴 𝚁 𝚂 ꒱ㆍ₊⊹*
> ✐ Crea y manipula stickers divertidos.

✿︎ ${prefix}s • ${prefix}sticker
> ❀ Convierte imágenes o videos en stickers.
✿︎ ${prefix}qc • ${prefix}quote
> ❀ Crea un sticker con texto tipo mensaje.
✿︎ ${prefix}stickerly • ${prefix}sly • ${prefix}pack
> ❀ Busca packs de stickers completos.
✿︎ ${prefix}emojimix • ${prefix}emix
> ❀ Mezcla dos emojis en un sticker.

*˚.⋆ֹ　 ꒰ 𝚃 𝙾 𝙾 𝙻 𝚂 – 𝚄 𝚃 𝙸 𝙻 𝚂 ꒱ㆍ₊⊹*
> ✐ Utilidades prácticas para tu día a día.

✿︎ ${prefix}toimg • ${prefix}img • ${prefix}tophoto
> ❀ Convierte stickers en imágenes.
✿︎ ${prefix}hd • ${prefix}remini • ${prefix}enhance
> ❀ Mejora la calidad de tus fotos.
✿︎ ${prefix}read • ${prefix}ver • ${prefix}readvo
> ❀ Revela mensajes de "Ver una sola vez".
✿︎ ${prefix}ssweb • ${prefix}ss • ${prefix}screenshot
> ❀ Captura de pantalla de un sitio web.
✿︎ ${prefix}get • ${prefix}fetch • ${prefix}getjson
> ❀ Obtén el código fuente de un JSON/API.

*˚.⋆ֹ　 ꒰ 𝙸 𝙰 – 𝚂 𝙴 𝙰 𝚁 𝙲 𝙷 ꒱ㆍ₊⊹*
> ✐ Inteligencia artificial y búsquedas.

✿︎ ${prefix}ia • ${prefix}gpt • ${prefix}gemini
> ❀ Chatea con la inteligencia artificial.
✿︎ ${prefix}pin • ${prefix}pinterest
> ❀ Busca imágenes estéticas en Pinterest (x5).

*˚.⋆ֹ　 ꒰ 𝙶 𝚁 𝙾 𝚄 𝙿 𝚂 ꒱ㆍ₊⊹*
> ✐ Gestión de grupos y administración.

✿︎ ${prefix}inspect • ${prefix}revisar • ${prefix}ginfo
> ❀ Obtén información de un grupo mediante link.
✿︎ ${prefix}link • ${prefix}grouplink
> ❀ Obtén el enlace de invitación del grupo.

*˚.⋆ֹ　 ꒰ 𝚂 𝙾 𝙲 𝙺 𝙴 𝚃 𝚂 ꒱ㆍ₊⊹*
> ✐ Gestión de sub-bots y conexiones.

✿︎ ${prefix}code
> ❀ Hazte Sub-Bot de 𝓜𝓲𝓼𝓪.
✿︎ ${prefix}bots • ${prefix}sockets
> ❀ Mira la lista de sockets activos.

*˚.⋆ֹ　 ꒰ 𝙾 𝚆 𝙽 𝙴 𝚁 ꒱ㆍ₊⊹*
> ✐ Herramientas exclusivas del owner/creador.

✿︎ ${prefix}up • ${prefix}update
> ❀ Sincroniza el bot con el repositorio GitHub.

‧₊˚ *Powered by* \`𝓜𝓲𝓼𝓪\` ♡ ‧₊˚ `;

            await conn.sendMessage(m.key.remoteJid, { 
                text: textoMenu,
                contextInfo: {
                    externalAdReply: {
                        title: '𝓜𝓲𝓼𝓪  𝘽𝙊𝙏 🖤',
                        body: 'Misa Bot | Developed by Yanniel',
                        thumbnailUrl: 'https://i.pinimg.com/736x/30/6d/5d/306d5d75b0e4be7706e4fe784507154b.jpg', 
                        sourceUrl: 'https://github.com/yannielmedrano1-sys/Misa-Bot',
                        mediaType: 1,
                        renderLargerThumbnail: true, 
                        showAdAttribution: false 
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;
