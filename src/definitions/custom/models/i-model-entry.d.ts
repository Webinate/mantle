declare namespace Modepress {
    /*
     * Base interface for all models
     */
    export interface IModelEntry {
        _id?: any;
        _requiredDependencies?: Array<{ collection: string, _id: any }>
        _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
        _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
    }
}