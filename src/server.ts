import express from 'express'
import { Storage } from '@google-cloud/storage'


const app = express()
const port = 8080
const storage = new Storage()
const bucket = await storage.bucket(process.env.BUCKET_NAME!)
app.set('etag', false)

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

    const sendFraCache = () => {
        res.contentType(cache[filnavn].contentType)
        res.send(cache[filnavn].content)
    }
    if (cache[filnavn]) {
        sendFraCache()
    }
    try {
        const content = (await bucket.file(filnavn).download())[0]
        const metadata = (await bucket.file(filnavn).getMetadata())
        console.log(metadata[0])
        cache[filnavn] = {
            content,
            contentType: metadata[0].type
        }
        sendFraCache()
    } catch (e) {
        console.error('ops', e)
        res.sendStatus(404)
    }
})


app.listen(port, () => console.log(`Flex static files lytter på ${port}!`))
