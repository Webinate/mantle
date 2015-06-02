declare module "mongodb" {

	/**
	* A wrapper that contains the result status of the mongo shell write methods.
	*/
	export interface WriteResult<T>
	{
		connection?: any;
		ops: Array<T>;
		result: {

			/** The number of entries affected */
			n: number;
			ok: number;
		}
	}
}