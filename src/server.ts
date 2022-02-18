import express from 'express'
import { DownloadResponse, Storage } from '@google-cloud/storage'


const app = express()
const port = 8080
const storage = new Storage()
const bucket = await storage.bucket(process.env.BUCKET_NAME!)

type InMemFileCache = {
    [key: string]: DownloadResponse;
};

const cache: InMemFileCache = {}

app.get('/internal/health', async(req, res) => {
    res.json({ status: 'ok' })
})


app.get('*', async(req, res) => {
    const filnavn = req.path.slice(1)
    if (cache[filnavn]) {
        res.send(cache[filnavn])
    }
    try {
        const a = await bucket.file(filnavn).download()
        cache[filnavn] = a
        res.send(a)
    } catch (e) {
        console.error('ops', e)
        res.sendStatus(404)
    }
})


app.listen(port, () => console.log(`Flex static files lytter på ${port}!`))
