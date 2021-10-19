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
    public readonly publicURLBase?: string
  ) {
    this.client = new Client(options)
    this.client.listBuckets((err, buckets) => {
      if (buckets && !buckets.some((b) => b.name === bucket)) {
        this.client.makeBucket(bucket, options.region || '').then(() => {
          if (publicURLBase) this.client.setBucketPolicy(bucket, 'public')
        })
      }
    })
    if (this.publicURLBase === 'auto')
      this.publicURLBase = `https://${this.options.endPoint}/${this.bucket}`
  }
  client: Client

  getPublicFileURL(path: string) {
    return this.publicURLBase ? `${this.publicURLBase}/${path}` : null
  }

  async getSignedFileURL(path: string, expiry: number = 7 * 86400) {
    return await this.client.presignedGetObject(this.bucket, path, expiry)
  }
}

const STORAGES = {
  test: new BucketStorage('public-bucket', DEFAULT_STORAGE_PROVIDER),
  default: new BucketStorage('public-bucket', DEFAULT_STORAGE_PROVIDER),
}

export const STORAGE_OPTIONS = Object.keys(STORAGES)

export function getStorage(storage: string): BucketStorage {
  return STORAGES[storage]
}
