import { Client, ClientOptions } from 'minio'

const port = process.env.REDWOOD_MINIO_PORT
  ? { port: parseInt(process.env.REDWOOD_MINIO_PORT) }
  : null

export const DEFAULT_STORAGE_PROVIDER: ClientOptions = {
  endPoint: process.env.REDWOOD_MINIO_HOST,
  accessKey: process.env.REDWOOD_MINIO_ACCESS,
  secretKey: process.env.REDWOOD_MINIO_SECRET,
  useSSL: true,
  ...port,
}

export class BucketStorage {
  constructor(
    public readonly bucket: string,
    public readonly options: ClientOptions,
    public readonly publicURL?: string
  ) {
    this.client = new Client(options)
    this.client.listBuckets((err, buckets) => {
      if (buckets && !buckets.some((b) => b.name === bucket)) {
        this.client.makeBucket(bucket, options.region || '').then(() => {
          if (publicURL) this.client.setBucketPolicy(bucket, 'public')
        })
      }
    })
    if (this.publicURL === 'auto')
      this.publicURL = `https://${this.options.endPoint}/${this.bucket}`
  }
  client: Client

  getPublicFileURL(path: string) {
    return this.publicURL ? `${this.publicURL}/${path}` : null
  }

  async getSignedFileURL(path: string, expiry: number = 7 * 86400) {
    return await this.client.presignedGetObject(this.bucket, path, expiry)
  }
}

const STORAGES = {
  test: new BucketStorage('public-bucket', DEFAULT_STORAGE_PROVIDER),
}

export function getStorage(storage: string): BucketStorage {
  return STORAGES[storage]
}
