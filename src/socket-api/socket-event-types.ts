'use strict';

/**
 * Describes the type of token data being sent to connected clients
 */
export enum ClientInstructionType {
  /**
   * Event sent to clients whenever a user logs in.
   * Event type: IUserToken
   */
  Login = 1,

  /**
   * Event sent to clients whenever a user logs out.
   * Event type: IUserToken
   */
  Logout = 2,

  /**
   * Event sent to clients whenever a user's account is activated.
   * Event type: IUserToken
   */
  Activated = 3,

  /**
   * Event sent to clients whenever a user's account is removed.
   * Event type: IUserToken
   */
  Removed = 4,

  /**
   * Event sent to clients whenever a user uploads a new file.
   * Event type: IFileToken
   */
  FileUploaded = 5,

  /**
   * Event sent to clients whenever a user file is removed.
   * Event type: IFileToken
   */
  FileRemoved = 6,

  /**
   * Event sent to clients whenever a user creates a new volume
   * Event type: IVolumeToken
   */
  VolumeUploaded = 7,

  /**
   * Event sent to clients whenever a user removes a volume
   * Event type: IVolumeToken
   */
  VolumeRemoved = 8,

  /**
   * Event both sent to the server as well as optionally to clients. Gets or sets user meta data.
   * Event type: IMetaToken
   */
  MetaRequest = 9
}

/**
 * Describes the type of token data being sent to connected clients
 */
export enum ServerInstructionType {
  /**
   * Event both sent to the server as well as optionally to clients. Gets or sets user meta data.
   * Event type: IMetaToken
   */
  MetaRequest = 9
}
