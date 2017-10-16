const utils = require( '../utils.js' );

/**
 * Base class for all page tests
 */
class Page {

  constructor() {
  }

  async load() {
    this.page = utils.page;
    this.browser = utils.browser;
    this.config = utils.config;
  }

  /**
   * Go to a given ulr
   * @param {string} path The url to direct the page to
   * @returns {Promise<void>}
   */
  to( path ) {
    return this.page.goto( utils.host + path );
  }

  /**
   * Gets a textfield's error text if it exists
   * @param {string} selector The selector for targetting the textfield. E.g. '.sometext' or '#sometext'
   * @returns {Promise<string|null>}
   */
  async textfieldError( selector ) {
    return this.getElmText( `${ selector } > div:nth-child(4)` );
  }

  /**
   * Gets an elements text content or null
   * @param {string} selector
   * @returns {Promise<string|null>}
   */
  async getElmText( selector ) {
    const elm = await this.page.$( `${ selector }` );
    if ( elm )
      return await this.page.$eval( `${ selector }`, elm => elm.textContent );

    return null;
  }

  /**
   * @returns {string} Gets the current page window.location.pathname
   */
  async pathname() {
    let location = await this.page.evaluate( async () => window.location );
    return location.pathname;
  }

  /**
   * Gets or sets the a textfield input's value
   * @param {string} selector The selector of the textfield. This must be the parent of the input, like
   * a classname. So this '.my-input' will translate into '.my-input input'
   * @param {string|undefined|''} val If a string is provided, then the value is typed into the input.
   * If the value is undefined, then the inputs value is returned. If the an empty string is provided, then
   * the input is cleared
   * @returns {Promise<string>}
   */
  async textfield( selector, val ) {

    // If nothing specified - then return the value
    if ( val === undefined )
      return await this.page.$eval( `${ selector } input`, el => el.value );

    // If a string, then type the value
    else if ( val !== '' ) {

      await this.page.focus( `${ selector } input` );

      await this.page.evaluate( async ( data ) => {
        document.querySelector( data ).value = '';
      }, `${ selector } input` );

      await this.page.type( val, { delay: 10 } );
    }
    // Else clear the input
    else {
      await this.page.focus( `${ selector } input` );
      const curVal = await this.page.$eval( `${ selector } input`, el => el.value );
      const promises = [];
      for ( let i = 0, l = curVal.length; i < l; i++ )
        promises.push( this.page.press( 'Backspace' ) );

      await Promise.all( promises );
    }
  }

  $( selector ) { return this.page.$( selector ) }
  waitFor( selector ) { return this.page.waitFor( selector ) }
}


module.exports = Page;