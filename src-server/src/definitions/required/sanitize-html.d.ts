// Based on the module: https://www.npmjs.com/package/sanitize-html
// Written by Mathew Henson

declare module "sanitize-html"
{
    /**
    Santizes a dirty piece of html code. Below you will find some examples of its use
        
    // Simple example
    var dirty = 'some really tacky HTML';
    var clean = sanitizeHtml(dirty);
    
    // Allow only a super restricted set of tags and attributes
    clean = sanitizeHtml(dirty, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
        allowedAttributes: {
            'a': [ 'href' ]
        }
    });

    // I like your set but I want to add one more tag. Is there a convenient way?
    clean = sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    });
    */
   function sanitizeHtml(html: string, options?: {
        allowedTags?: Array<string>;
        allowedAttributes?: { [name: string]: Array<string> };
        selfClosing?: Array<string>;
        allowedSchemes?: Array<string>;
    }): string;

   export = sanitizeHtml;
}