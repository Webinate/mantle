import { IConfig } from '../../types/config/i-config';
import { IClient } from '../../types/config/properties/i-client';
/**
 * Traverses a directory and each of its folders to find any modepress.json config files
 */
export declare function discoverClients(config: IConfig): Promise<(IClient & {
    path: string;
})[]>;
/**
 * initialization function to prep DB and servers
 */
export declare function initialize(): Promise<void>;
