import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Address, AddressRecord } from '../types/address.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const defaultAddressFilePath = path.resolve(__dirname, '../data/addresses.json');

export class AddressRepository {
  constructor(private readonly filePath = defaultAddressFilePath) {}

  async getAll(): Promise<AddressRecord[]> {
    await fs.ensureFile(this.filePath);

    try {
      const records = await fs.readJson(this.filePath);
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  }

  async getByUsername(username: string): Promise<Address | null> {
    const records = await this.getAll();
    return records.find(record => record.username === username)?.address ?? null;
  }

  async create(username: string, address: Address): Promise<Address> {
    const records = await this.getAll();
    records.push({ username, address });
    await fs.writeJson(this.filePath, records, { spaces: 2 });
    return address;
  }
}

export const addressRepository = new AddressRepository();
