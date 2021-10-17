import { Client, ClientOptions } from 'minio'
import * as Stream from 'stream'

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
      if (!buckets.some((b) => b.name === bucket)) {
        this.client.makeBucket(bucket, options.region || '').then(() => {
          if (publicURL) this.client.setBucketPolicy(bucket, 'public')
        })
      }
    })
  }
  client: Client
}

const STORAGES = {
  test: new BucketStorage('public-bucket', DEFAULT_STORAGE_PROVIDER),
}

export function getStorage(storage: string): BucketStorage {
  return STORAGES[storage]
}

export async function putNamespaced(
  storage: BucketStorage,
  namespace: string,
  path: string,
  data: string | Buffer | Stream.Readable
) {
  const fullpath = `${namespace}/${path}`
  const result = await storage.client.putObject(storage.bucket, fullpath, data)
  const bucketURL = storage.publicURL
    ? storage.publicURL
    : `https://${storage.options.endPoint}/${storage.bucket}`
  const fileURL = `${bucketURL}/${fullpath}`
  return { ...result, bucketURL, fileURL }
}
