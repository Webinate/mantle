import { IConfig } from '../../types/config/i-config';
import { Db } from 'mongodb';
/**
 * Prepares the database and any dependencies of the collections
 */
export declare function prepare(db: Db, config: IConfig): Promise<void>;
