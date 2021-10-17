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
  constructor(public readonly bucket: string, public readonly client: Client) {}
}

const STORAGES = {
  test: new BucketStorage(
    'test.minio.io',
    new Client(DEFAULT_STORAGE_PROVIDER)
  ),
}

export function getStorage(storage: string) {
  return STORAGES[storage]
}
