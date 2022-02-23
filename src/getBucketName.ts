import { logger } from './logger'

export function getBucketName() {
    const bucketname = process.env.BUCKET_NAME
    if (bucketname) {
        return bucketname as string
    }
    logger.error('Mangler miljøvariabel BUCKET_NAME')
    process.exit(-1)
}
