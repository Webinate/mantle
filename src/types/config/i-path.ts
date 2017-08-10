declare module 'modepress' {
  /**
   * Defines routes and the paths they take
   */
  export interface IPath {
    /**
     * The express end point route to use. E.g. '*' or '/some-route'
     */
    path: string;

    /**
     * The file to be sent when the path resolves. This must be a file path and point to a file that exists.
     * The file could be any valid html file. Alternatively it can be rendered as an express jade file (.jade)
     */
    index: string;

    /**
     * An array of javascript file paths that should be added to the page when it loads
     * e.g. ['./plugins/my-plugin/index.js']
     */
    plugins: Array<string>;

    /**
     * An array of javascript variables that will be sent to any jade templates for a given path
     */
    variables: { [ name: string ]: string };
  }
}