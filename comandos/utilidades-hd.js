// category: utilidades
case 'hd': {
    const desc = 'Mejora la calidad de una imagen'

    let method = 1
    let size = 'low'

    if (args[0] && ['1', '2', '3', '4'].includes(args[0])) {
        method = parseInt(args[0])
        if (method === 1) size = 'low'
        else if (method === 2) size = 'medium'
        else if (method === 3 || method === 4) size = 'high'
    }

    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message
    const mime = q?.imageMessage?.mimetype || q?.documentMessage?.mimetype || ''

    if (!/image/.test(mime)) {
        return reply(* Responde a una imagen para mejorar la* \`Calidad\`)
    }

    await conn.sendMessage(from, { react: { text: '🕔', key: msg.key } })

    try {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
        const messageType = q.imageMessage ? 'image' : 'document'
        const stream = await downloadContentFromMessage(q[messageType + 'Message'], messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        await conn.sendMessage(from, { react: { text: '✨', key: msg.key } })

        async function ihancer(buffer, { method = 1, size = 'low' } = {}) {
            if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Imagen requerida');

            const FormData = (await import('form-data')).default
            const form = new FormData();
            form.append('method', method.toString());
            form.append('is_pro_version', 'false');
            form.append('is_enhancing_more', 'false');
            form.append('max_image_size', size);
            form.append('file', buffer, { filename: file_${Date.now()}.jpg, contentType: 'image/jpeg' });

            const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
                headers: {
                    ...form.getHeaders(),
                    'accept-encoding': 'gzip',
                    'host': 'ihancer.com',
                    'user-agent': 'Dart/3.5 (dart:io)'
                },
                responseType: 'arraybuffer',
                timeout: 60000
            });

            return Buffer.from(data);
        }

        const enhancedBuffer = await ihancer(buffer, { method: method, size: size })

        const encabezado = `┏━━━━❏
┃ \Método\: ${method}x
┃ \Calidad\: ${size}
┃ \Mejorado por\: IA-Mejora
┗━━❏`

        await conn.sendMessage(from, {
            image: enhancedBuffer,
            caption: encabezado
        }, { quoted: msg })

        await conn.sendMessage(from, { react: { text: '✅', key: msg.key } })

    } catch (e) {
        console.error('Error en hd:', e)
        reply(> ✐ \`Error:\ ${e.message}`)
        await conn.sendMessage(from, { react: { text: '❌', key: msg.key } })
    }
    break
}
