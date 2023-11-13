export abstract class BaseRepository<T> {
  abstract createOne(item: T): Promise<T>;

  abstract createMany(items: T[]): Promise<T[]>;

  abstract updateOne(id: string, item: T): Promise<T | null>;

  abstract updateMany(id: string, items: T[]): Promise<T[]>;

  abstract deleteOne(id: string): Promise<void>;

  abstract deleteMany(ids: string[]): Promise<void>;

  abstract findOne(id: string): Promise<T | null>;

  abstract findAll(): Promise<T[]>;
}
