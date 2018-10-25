import { IAuthReq } from '../types/tokens/i-auth-request';
import { ObjectID } from 'mongodb';

export function validId( idName: string, idLabel: string = '', optional: boolean = false ) {
  return function( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const req = arguments[ 0 ] as IAuthReq;

      // Make sure the id
      if ( !req.params[ idName ] && !optional )
        throw new Error( `Please specify an ${!idLabel || idLabel === '' ? idLabel : idName}` );

      // Make sure the id format is correct
      else if ( req.params[ idName ] && !ObjectID.isValid( req.params[ idName ] ) )
        throw new Error( `Invalid ${idLabel} format` );

      const result = originalMethod.apply( this, arguments );
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  }
}