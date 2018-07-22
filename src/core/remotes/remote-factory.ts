import { IConfig } from '../../types/config/i-config';
import { Db } from 'mongodb';
import { googleVolume, GoogleVolume } from './google-volume';
import { localVolume, LocalVolume } from './local-volume';
import { IGoogleProperties } from '../../types/config/properties/i-google';
import { ILocalVolume } from '../../types/config/properties/i-remote-options';
import { IRemote } from '../../types/interfaces/i-remote';

/**
 * Factory classs for creating & getting models
 */
export class RemoteFactory {

  /**
   * Initializes the controller
   * @param db The mongo db
   */
  initialize( config: IConfig, db: Db ) {
    return Promise.all( [
      googleVolume.initialize( config.remotes.google as IGoogleProperties ),
      localVolume.initialize( config.remotes.local as ILocalVolume )
    ] );
  }

  get( type: 'google' ): GoogleVolume
  get( type: 'local' ): LocalVolume
  get( type: string ): IRemote
  get( type: string ): IRemote {
    if ( type === 'local' )
      return localVolume;
    if ( type === 'google' )
      return googleVolume;

    throw new Error( `Cannot find remote '${type}'` );
  }
}


export default new RemoteFactory();