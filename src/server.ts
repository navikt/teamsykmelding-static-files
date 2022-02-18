import express from 'express'
import { DownloadResponse, Storage } from '@google-cloud/storage'


const app = express()
const port = 8080
const storage = new Storage()
const bucket = await storage.bucket(process.env.BUCKET_NAME! )

type InMemFileCache = {
    [key: string]: DownloadResponse;
};

const cache: InMemFileCache = {}

app.get('/internal/health', async(req, res) => {
    res.json({ status: 'ok' })
})


app.get('*', async(req, res) => {
    if(cache[req.path]){
        res.send(cache[req.path])
    }
    const a = await bucket.file('sdf').download()
    cache[req.path] = a
    res.send(a)
})


app.listen(port, () => console.log(`Flex static files lytter på ${port}!`))
