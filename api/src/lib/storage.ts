import { Client, ClientOptions } from 'minio'

const port = process.env.REDWOOD_MINIO_PORT
  ? { port: parseInt(process.env.REDWOOD_MINIO_PORT) }
  : null

export const HAS_DEFAULT_STORAGE = Boolean(
  process.env.REDWOOD_MINIO_ACCESS_KEY &&
    process.env.REDWOOD_MINIO_SECRET_KEY &&
    process.env.REDWOOD_MINIO_HOST
)

export const DEFAULT_STORAGE_PROVIDER: ClientOptions = HAS_DEFAULT_STORAGE
  ? {
      endPoint: process.env.REDWOOD_MINIO_HOST,
      accessKey: process.env.REDWOOD_MINIO_ACCESS_KEY,
      secretKey: process.env.REDWOOD_MINIO_SECRET_KEY,
      useSSL: process.env.REDWOOD_MINIO_SSL === 'true',
      ...port,
    }
  : undefined

export class BucketStorage {
  constructor(
    public readonly bucket: string,
    public readonly options: ClientOptions,
    public readonly publicURLBase?: string,
    public readonly fixedSignedURL?: (string) => string
  ) {
    this.client = new Client(options)
    this.client.listBuckets((err, buckets) => {
      if (buckets && !buckets.some((b) => b.name === bucket)) {
        this.client.makeBucket(bucket, options.region || '').then(() => {
          if (this.publicURLBase) {
            Promise.resolve(this.client.setBucketPolicy(bucket, 'public'))
          }
        })
      }
    })
    if (this.publicURLBase === 'auto')
      this.publicURLBase = `https://${this.options.endPoint}/${this.bucket}`
  }
  client: Client

  public getPublicFileURL(path: string) {
    console.log(999, this)
    return this.publicURLBase ? `${this.publicURLBase}/${path}` : null
  }

  public async getSignedFileURL(path: string, expiry: number = 7 * 86400) {
    return await this.client.presignedGetObject(this.bucket, path, expiry)
  }
}

const STORAGES = HAS_DEFAULT_STORAGE
  ? {
      test: new BucketStorage('redwoodblog-test', DEFAULT_STORAGE_PROVIDER),
      default: new BucketStorage(
        'redwoodblog-public',
        DEFAULT_STORAGE_PROVIDER,
        'http://localhost:8910/redwoodblog-public'
      ),
    }
  : {}

export const STORAGE_OPTIONS = Object.keys(STORAGES)

export function getStorage(storage: string): BucketStorage {
  return STORAGES[storage]
}
