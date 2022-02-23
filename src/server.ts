import express from 'express'
import { Storage } from '@google-cloud/storage'


const app = express()
const port = 8080
const storage = new Storage()
const bucket = await storage.bucket(process.env.BUCKET_NAME!)

app.set('x-powered-by', false)

interface File {
    content: Buffer,
    contentType: string,
}

type InMemFileCache = {
    [key: string]: File;
};

const cache: InMemFileCache = {}

app.get('/internal/health', async(req, res) => {
    res.json({ status: 'ok' })
})


app.get('*', async(req, res) => {
    const filnavn = req.path.slice(1)

    const sendFil = (file: File) => {
        res.contentType(file.contentType)
        res.setHeader('cache-control', 'public, max-age=31536000, immutable')
        res.send(file.content)
    }
    const cacheElement = cache[filnavn]
    if (cacheElement) {
        sendFil(cacheElement)
        return
    }
    try {
        const content = (await bucket.file(filnavn).download())[0]
        const contentType = (await bucket.file(filnavn).getMetadata())[0].contentType
        const file = {
            content,
            contentType
        }
        cache[filnavn] = file
        sendFil(file)
    } catch (e: any) {
        if (e.statusCode == 404) {
            res.sendStatus(404)
        }
        console.error('ops', e)
        res.sendStatus(500)
    }
})


app.listen(port, () => console.log(`Flex static files lytter på ${port}!`))
