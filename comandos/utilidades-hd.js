import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import fetch from 'node-fetch'

const upscaleMisa = {
    name: 'hd',
    alias: ['enhance', 'remini', 'mejorar'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, command }) => {
        const chat = m.key.remoteJid
        try {
            const q = m.quoted || m
            const mime = q?.mimetype || q?.msg?.mimetype || ''

            if (!mime) return conn.sendMessage(chat, { text: `> ✐  *Responde a una imagen para mejorar su calidad.* ✧` }, { quoted: m })
            if (!/^image\/(jpe?g|png|webp)$/i.test(mime)) return conn.sendMessage(chat, { text: `> ✐  *El formato ${mime} no es compatible.*` }, { quoted: m })

            await conn.sendMessage(chat, { react: { text: '🕒', key: m.key } })

            const buffer = await q.download?.()
            if (!buffer) return conn.sendMessage(chat, { text: `> ✐  *No se pudo descargar la imagen.*` }, { quoted: m })

            const ft = await fileTypeFromBuffer(buffer)
            const inputMime = ft?.mime || mime
            
            // Proceso de mejora
            const result = await vectorinkEnhanceFromBuffer(buffer, inputMime)

            if (!result?.ok || !result?.buffer) {
                const msg = result?.error?.message || 'Error en el servidor'
                await conn.sendMessage(chat, { react: { text: '✖️', key: m.key } })
                return conn.sendMessage(chat, { text: `> ✐  *No se pudo mejorar la imagen:* ${msg}` }, { quoted: m })
            }

            const caption = `
ʚ 𝐌𝐢𝐬𝐚 𝐇𝐃 𝐄𝐧𝐡𝐚𝐧𝐜𝐞 ɞ
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Estado:* ¡Calidad mejorada!
   > ✿ *Proveedor:* VectorInk AI

> Powered by 𝓜𝓲𝓼𝓪 ♡`.trim()

            await conn.sendMessage(chat, { image: result.buffer, caption }, { quoted: m })
            await conn.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.error("ERROR HD MISA:", e)
            await conn.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await conn.sendMessage(chat, { text: `> ✐  *Error inesperado:* ${e.message}` }, { quoted: m })
        }
    }
}

// --- FUNCIONES INTERNAS (Basadas en tu código HD) ---

async function vectorinkEnhanceFromBuffer(inputBuf, inputMime) {
    const API = 'https://us-central1-vector-ink.cloudfunctions.net/upscaleImage'
    const tmpDir = path.join(os.tmpdir(), 'misa_hd')
    const out = { ok: false }

    try {
        await fsp.mkdir(tmpDir, { recursive: true })
        const b64 = inputBuf.toString('base64')

        const r = await fetch(API, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'origin': 'https://vectorink.io',
                'user-agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({ data: { image: b64 } })
        })

        const j = await r.json()
        const inner = JSON.parse(j?.result || '{}')
        const webpB64 = inner?.image?.b64_json

        if (!webpB64) throw new Error("No B64 result")

        const webpBuf = Buffer.from(webpB64, 'base64')
        
        // Conversión a PNG usando tu lógica de FFmpeg
        const conv = await webpToPngWithFfmpeg(webpBuf, tmpDir)
        
        if (conv.ok) {
            out.ok = true
            out.buffer = conv.png
        }
        return out
    } catch (e) {
        out.error = e
        return out
    }
}

function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args)
        p.on('close', (code) => code === 0 ? resolve(true) : reject(false))
        p.on('error', reject)
    })
}

async function webpToPngWithFfmpeg(webpBuf, tmpDir) {
    const inPath = path.join(tmpDir, `hd_${Date.now()}.webp`)
    const outPath = path.join(tmpDir, `hd_${Date.now()}.png`)
    await fsp.writeFile(inPath, webpBuf)
    try {
        await runFfmpeg(['-y', '-i', inPath, outPath])
        const png = await fsp.readFile(outPath)
        return { ok: true, png }
    } catch (e) {
        return { ok: false, error: e }
    } finally {
        try { await fsp.unlink(inPath); await fsp.unlink(outPath); } catch {}
    }
}

export default upscaleMisa
