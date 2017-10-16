import * as React from 'react';

export default ( props: React.HTMLAttributes<any> ) => {
  return (
    <div
      { ...props }
      style={{
        ...props.style, ...{
          height: '100%',
          background: '#efefef',
          backgroundImage: `url('../images/rocks.svg')`,
          backgroundSize: 'cover'
        }
      }}
    >
      {props.children}
    </div>
  );
}