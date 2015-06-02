declare module "webinate-colors"
{
	/**
	* A simple class that chains together escaped console commands
	*/
    class Painter
    {
		/**
		* Creates an instance of the Painter class
		* @param {string} text [Optional] Specify the text of the painter
		*/
        constructor(text: string);

		/**
		* White background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        whiteBG(text?: string): Painter;

		/**
		* Grey background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        greyBG(text?: string): Painter;

		/**
		* Black background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        blackBG(text?: string): Painter;

		/**
		* Blue background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        blueBG(text?: string): Painter;

		/**
		* Cyan background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        cyanBG(text?: string): Painter;

		/**
		* Green background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        greenBG(text?: string): Painter;

		/**
		* Magenta background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        magentaBG(text?: string): Painter;

		/**
		* Red background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        redBG(text?: string): Painter;

		/**
		* Yellow background
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        yellowBG(text?: string): Painter;
	
		/**
		* Bolds the text
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        bold(text?: string): Painter;

		/**
		* Italics the text
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        italic(text?: string): Painter;

		/**
		* Underlines the text
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        underline(text?: string): Painter;

		/**
		* Inverts the text
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        inverse(text?: string): Painter;

		/**
		* Strikes the text
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        strikeThrough(text?: string): Painter;

		/**
		* Sets the text grey
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        grey(text?: string): Painter;

		/**
		* Sets the text white
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        white(text?: string): Painter;

		/**
		* Sets the text black
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        black(text?: string): Painter;

		/**
		* Sets the text blue
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        blue(text?: string): Painter;

		/**
		* Sets the text cyan
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        cyan(text?: string): Painter;

		/**
		* Sets the text green
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        green(text?: string): Painter;

		/**
		* Sets the text magenta
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        magenta(text?: string): Painter;

		/**
		* Sets the text red
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        red(text?: string): Painter;

		/**
		* Sets the text yellow
		* @param {string} text [Optional] Specify the text of the painter
		* @returns {Painter}
		*/
        yellow(text?: string): Painter;

		/**
		* Combines the codes and text into a single string
		* @returns {string}
		*/
        toString(): string;
    }

	/**
	* Bolds the text
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function bold(text?: string): Painter;

	/**
	* Italics the text
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function italic(text?: string): Painter;

	/**
	* Underlines the text
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function underline(text?: string): Painter;

	/**
	* Strikes the text
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function strikeThrough(text?: string): Painter;

	/**
	* Inverts the text
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function inverse(text?: string): Painter;

	/**
	* White background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function whiteBG(text?: string): Painter;

	/**
	* Grey background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function greyBG(text?: string): Painter;

	/**
	* Black background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function blackBG(text?: string): Painter;

	/**
	* Blue background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function blueBG(text?: string): Painter;

	/**
	* Cyan background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function cyanBG(text?: string): Painter;

	/**
	* Green background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function greenBG(text?: string): Painter;

	/**
	* Magenta background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function magentaBG(text?: string): Painter;
	/**
	* Red background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function redBG(text?: string): Painter;
	/**
	* Yellow background
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function yellowBG(text?: string): Painter;

	/**
	* Sets the text to white
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function white(text?: string): Painter;

	/**
	* Sets the text to grey
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function grey(text?: string): Painter;

	/**
	* Sets the text to black
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function black(text?: string): Painter;

	/**
	* Sets the text to blue
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function blue(text?: string): Painter;

	/**
	* Sets the text to cyan
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function cyan(text?: string): Painter;

	/**
	* Sets the text to green
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function green(text?: string): Painter;

	/**
	* Sets the text to magenta
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function magenta(text?: string): Painter;

	/**
	* Sets the text to red
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function red(text?: string): Painter;

	/**
	* Sets the text to yellow
	* @param {string} text [Optional] Specify the text of the painter
	* @returns {Painter}
	*/
    export function yellow(text?: string): Painter;

	/**
	* Logs a message to the console
	* @param {Painter} painter
	*/
    export function log(painter: Painter);
}