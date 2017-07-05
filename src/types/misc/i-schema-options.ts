declare module 'modepress' {
    /**
     * A list of optional parameters that can be passed to schema items that determines how they are
     * serialized
     */
    export interface ISchemaOptions {

        /**
         * If true, foreign keys will serialize their values
         */
        expandForeignKeys?: boolean;

        /**
         * When fetching schema data, we need to define if the query is verbose or not.
         * If true, then all data is returned and is not stripped of sensitive items
         */
        verbose: boolean

        /**
         * Defines how many levels deep foreign key traversal iterates. If 1, then only the immediate foreign keys
         * are fetched. For example  Model X references model Y, which in turn references another model X. When expandMaxDepth=1
         * only model X and its model Y instance are returned (Model Y's reference to any X is ignored)
         * Only read if expandForeignKeys is true.
         */
        expandMaxDepth?: number;

        /**
         * Defines an array of schema names that must not be expanded when expandForeignKeys is true.
         */
        expandSchemaBlacklist?: Array<string>;
    }
}