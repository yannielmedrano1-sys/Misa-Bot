import crypto from 'crypto'
import fileTypePkg from 'file-type'
import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

const { fileTypeFromBuffer } = fileTypePkg
const fetchFn = fetch

const hdCommand = {
    name: 'hd',
    alias: ['enhance', 'remini'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, { command }) => {
        const chat = m.key.remoteJid

        try {
            const q = m.quoted || m
            const mime = q?.mimetype || q?.msg?.mimetype || ''

            if (!mime) {
                return conn.sendMessage(chat, {
                    text: `🖼️ Responde a una imagen con *${command}*`
                }, { quoted: m })
            }

            if (!/^image\/(jpe?g|png|webp)$/i.test(mime)) {
                return conn.sendMessage(chat, {
                    text: `❌ Formato no compatible:\n${mime}`
                }, { quoted: m })
            }

            await conn.sendMessage(chat, {
                react: { text: '🕒', key: m.key }
            })

            const buffer = await q.download?.()

            if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 10) {
                throw new Error('No se pudo descargar la imagen')
            }

            const ft = await safeFileType(buffer)
            const inputMime = ft?.mime || mime || 'image/jpeg'

            const result = await vectorinkEnhanceFromBuffer(buffer, inputMime)

            if (!result?.ok || !result?.buffer) {
                throw new Error(
                    result?.error?.code ||
                    result?.error?.step ||
                    result?.error?.message ||
                    'Error desconocido'
                )
            }

            await conn.sendMessage(chat, {
                image: result.buffer,
                caption: '✨ Imagen mejorada con éxito'
            }, { quoted: m })

            await conn.sendMessage(chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (e) {
            console.error('HD ERROR:', e)

            await conn.sendMessage(chat, {
                react: { text: '✖️', key: m.key }
            })

            await conn.sendMessage(chat, {
                text: `❌ Error al mejorar imagen\n📌 ${e.message}`
            }, { quoted: m })
        }
    }
}

export default hdCommand

async function safeFileType(buf) {
    try {
        return await fileTypeFromBuffer(buf)
    } catch {
        return null
    }
}

async function safeJson(res) {
    const t = await res.text().catch(() => '')
    try {
        return JSON.parse(t)
    } catch {
        return { raw: t }
    }
}

function extFromMime(mime) {
    if (/png/i.test(mime)) return 'png'
    if (/webp/i.test(mime)) return 'webp'
    return 'jpg'
}

function runFfmpeg(args, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] })

        let err = ''

        const t = setTimeout(() => {
            try { p.kill('SIGKILL') } catch {}
            reject(new Error('ffmpeg timeout'))
        }, timeoutMs)

        p.stderr.on('data', d => err += d.toString())

        p.on('error', e => {
            clearTimeout(t)
            reject(e)
        })

        p.on('close', code => {
            clearTimeout(t)
            if (code === 0) resolve(true)
            else reject(new Error(err || `ffmpeg failed (${code})`))
        })
    })
}

async function webpToPngWithFfmpeg(webpBuf, tmpDir) {
    const inPath = path.join(tmpDir, `hd_${Date.now()}.webp`)
    const outPath = path.join(tmpDir, `hd_${Date.now()}.png`)

    await fsp.writeFile(inPath, webpBuf)

    try {
        await runFfmpeg(['-y', '-i', inPath, '-frames:v', '1', outPath])

        const png = await fsp.readFile(outPath)

        return { ok: true, png }

    } catch (e) {
        return { ok: false, error: e.message }

    } finally {
        try { await fsp.unlink(inPath) } catch {}
        try { await fsp.unlink(outPath) } catch {}
    }
}

async function vectorinkEnhanceFromBuffer(inputBuf, inputMime) {
    const API = 'https://us-central1-vector-ink.cloudfunctions.net/upscaleImage'

    const tmpDir = path.join(os.tmpdir(), 'vectorink')
    const tmpPath = path.join(tmpDir, `img_${Date.now()}.${extFromMime(inputMime)}`)

    const out = { ok: false }

    try {
        await fsp.mkdir(tmpDir, { recursive: true })
        await fsp.writeFile(tmpPath, inputBuf)

        const b64 = (await fsp.readFile(tmpPath)).toString('base64')

        const r = await fetchFn(API, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                origin: 'https://vectorink.io',
                referer: 'https://vectorink.io/'
            },
            body: JSON.stringify({
                data: { image: b64 }
            })
        })

        const j = await safeJson(r)

        const innerText = j?.result
        const inner = JSON.parse(innerText)

        const webpB64 = inner?.image?.b64_json

        if (!webpB64) {
            throw new Error('La API no devolvió imagen')
        }

        const webpBuf = Buffer.from(webpB64, 'base64')

        const conv = await webpToPngWithFfmpeg(webpBuf, tmpDir)

        if (!conv.ok) {
            throw new Error(conv.error)
        }

        out.ok = true
        out.buffer = conv.png

        return out

    } catch (e) {
        out.error = { message: e.message }
        return out

    } finally {
        try { await fsp.unlink(tmpPath) } catch {}
    }
}
