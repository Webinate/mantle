// incomplete definitions for http://www.tinymce.com

interface TinyMceObservable
{
    off: (name?: string, callback?: Function) => Object
    on: (name: string, callback: Function) => Object
    fire: (name: string, args?: Object, bubble?: Boolean) => Event
}

interface TinyMceEditor extends TinyMceObservable
{
    destroy: (automatic: boolean) => void
    remove: () => void
    hide: () => void
    show: () => void
    getContent: (args?: Object) => string
    setContent: (content: string, args?: Object) => string
    insertContent: (content: string) => string
    focus: (skip_focus?: Boolean) => void
    undoManager: TinyMceUndoManager
    settings: Object
}

interface TinyMceUndoManager
{
    undo: () => Object
    clear: () => void
    hasUndo: () => Boolean
}

interface TinyMceOptions
{
    /** Selector option, allows you to use CSS selector syntax for determining what areas should be editable, this is the recommended way of selecting what elements should be editable. **/
    selector?: string;

    content_css?: string;

    toolbar1?: string;
    toolbar2?: string;

    /** This option enables you to specify location of the current skin. Enables you to load TinyMCE from one URL for example a CDN then load a local skin on the current server. */
    skin_url?: string;

    /** This option enables you to auto focus an editor instance. The value of this option should be an editor instance id. The editor instance id is the id for the original textarea or div element that got replaced. */
    auto_focus?: string;

    /** Set the default directionality of the editor. Possible values are: ltr or rtl */
    directionality?: string;

    /** This option will make the editable are behave like very much like a <pre> tag, and add a scroll instead of wrapping text. */
    nowrap?: boolean;

    /** This options allows you to turn on/off the resizing handles on images, tables or media objects. This option is enabled by default and allows you to resize table and images. You can also specify a CSS3 selector of what you want to enable resizing on. */
    object_resizing?: boolean | string;

    /** Set the theme of TinyMCE. */
    theme?: string;

    /** This option enables you to specify location of the current theme. Enables you to load TinyMCE from one URL for example a CDN then load a local theme on the current server. */
    theme_url?: string;

    /**
    * Set what plugins should be included, by default, NO plugins are loaded.
    * See http://www.tinymce.com/wiki.php/Plugins
    */
    plugins?: Array<string>;

    /** Set the height of the editor **/
    height?: number;

    setup?: (editor) => void;
}

interface TinyMceStatic extends TinyMceObservable
{
    init: (settings: TinyMceOptions) => void;
    execCommand: (c: string, u: boolean, v: string) => Boolean;
    editors: Array<TinyMceEditor>;
    activeEditor: TinyMceEditor;
    get: (id: string) => TinyMceEditor;
    remove: (id?: string) => TinyMceEditor;
}

declare var tinymce: TinyMceStatic;