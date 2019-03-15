type Queue = {
  originalFunc: () => Promise<any>;
  originalContext: any;
  originalArgs: any;
};

const queue: Map<Function, Queue[]> = new Map();

/**
 * Blocks this route until any previous one is complete
 */
export function blocking() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunc = descriptor.value;

    if (!queue.get(originalFunc)) queue.set(originalFunc, []);

    // Editing the descriptor/value parameter
    descriptor.value = function() {
      const originalArgs = arguments;
      const originalContext = this;
      const queueItem = { originalFunc, originalArgs, originalContext };
      queue.get(originalFunc)!.push(queueItem);

      return new Promise(function(resolve, reject) {
        function doNext() {
          const next = queue.get(originalFunc)![0];

          if (next !== queueItem) {
            setTimeout(doNext, 30);
            return;
          }

          const result = next.originalFunc.apply(next.originalContext, next.originalArgs);

          if (result instanceof Promise) {
            result
              .then(result => {
                queue.get(originalFunc)!.shift();
                resolve(result);
              })
              .catch(err => {
                queue.get(originalFunc)!.shift();
                reject(err);
              });
          } else throw new Error('The block decorator must return a promise');
        }

        doNext();
      });
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
