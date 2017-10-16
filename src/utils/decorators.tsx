import * as Redux from 'react-redux';

/**
 * decorators buggy in TS, so this is necessary to overcome an issue using Redux @connect
 */
export function connectWrapper( mapStateToProps: any, mapDispatchToProps?: any, mergeProps?: any, options?: any ) {
  return ( target: any ) => ( Redux.connect( mapStateToProps, mapDispatchToProps, mergeProps, options )( target ) as any );
}

/**
 * Helper function, which examines & returns the return value of the expression
 * passed in.
 */
export function returntypeof<RT>( expression: ( ...params: any[] ) => RT ): RT {
  return {} as any;
}