import * as fs from 'fs';
import { IConfig } from '../../src/types';

/**
 * Loads any of the sensitive props in the config json
 */
function loadSensitiveProps(config: IConfig) {
  function loadProp(parentProp: any, prop: any, path: any) {
    if (typeof path === 'string') {
      if (!fs.existsSync(path)) throw new Error(`Property file '${path}' cannot be found`);
      else parentProp[prop] = JSON.parse(fs.readFileSync(path, 'utf8'));
    }
  }

  // Load and merge any sensitive json files
  loadProp(config, 'adminUser', config.adminUser);
  loadProp(config.remotes, 'google', config.remotes.google);
  loadProp(config.remotes, 'local', config.remotes.local);
  loadProp(config.mail, 'options', config.mail.options);
  loadProp(config, 'database', config.database);
}

export default function(path: string) {
  const config: IConfig = JSON.parse(fs.readFileSync(path).toString());
  loadSensitiveProps(config);
  return config;
}
