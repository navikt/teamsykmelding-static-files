import express from 'express'
import { Storage } from '@google-cloud/storage'
import { logger } from './logger'
import { InMemFile, FileCache } from './types'
import { getBucketName } from './getBucketName'


const app = express()
const port = 8080
const storage = new Storage()
const bucketName = getBucketName()
const bucket = await storage.bucket(bucketName)
const cache: FileCache = {}
const cacheFlushInterval = 60 * 60 * 1000 // 1 time i millisekunder

app.set('x-powered-by', false)

app.get('/internal/health', async(req, res) => res.sendStatus(200))

app.get('*', async(req, res) => {
    const filnavn = req.path.slice(1)

    const sendFil = (file: InMemFile) => {
        res.contentType(file.contentType)
        res.setHeader('cache-control', 'public, max-age=31536000, immutable')
        res.send(file.content)
    }
    const fil = cache[filnavn]
    if (fil) {
        sendFil(fil)
        return
    }
    try {
        logger.info(`Henter ${filnavn} fra bucket ${bucketName}`)

        const content = (await bucket.file(filnavn).download())[0]
        const contentType = (await bucket.file(filnavn).getMetadata())[0].contentType
        const hentetFil = {
            content,
            contentType
        }
        cache[filnavn] = hentetFil
        sendFil(hentetFil)
    } catch (e: any) {
        if (e.code == 404) {
            logger.warn(`404: ${filnavn}`)
            res.sendStatus(404)
        } else {
            logger.error({ msg: `Feil ved henting av ${filnavn}`, err: JSON.stringify(e) })
            res.sendStatus(500)
        }
    }
})

setInterval(() => {
    logger.info('Flusher cache')
    for (const member in cache) {
        logger.info(`Fjerner ${member} fra cache`)
        delete cache[member]
    }

}, cacheFlushInterval)

app.listen(port, () => logger.info(`Flex static files lytter på ${port}!`))

