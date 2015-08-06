// Based on https://github.com/chriso/validator.js/blob/master/validator.js
'use strict';
var email = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/, isbn13Maybe = /^(?:[0-9]{13})$/;
var ipv4Maybe = /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/, ipv6 = /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/;
var uuid = {
    '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
};
var alpha = /^[a-zA-Z]+$/, alphanumeric = /^[a-zA-Z0-9]+$/, safeCharacters = /^[a-zA-Z0-9_!@£$ ]+$/, numeric = /^-?[0-9]+$/, int = /^(?:-?(?:0|[1-9][0-9]*))$/, float = /^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/, hexadecimal = /^[0-9a-fA-F]+$/, hexcolor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
var ascii = /^[\x00-\x7F]+$/, multibyte = /[^\x00-\x7F]/, fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/, halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
function toString(input) {
    if (typeof input === 'object' && input !== null && input.toString) {
        input = input.toString();
    }
    else if (input === null || typeof input === 'undefined' || (isNaN(input) && !input.length)) {
        input = '';
    }
    else if (typeof input !== 'string') {
        input += '';
    }
    return input;
}
exports.toString = toString;
;
function toDate(date) {
    if (Object.prototype.toString.call(date) === '[object Date]') {
        return date;
    }
    date = Date.parse(date);
    return !isNaN(date) ? new Date(date) : null;
}
exports.toDate = toDate;
;
function toFloat(str) {
    return parseFloat(str);
}
exports.toFloat = toFloat;
;
function toInt(str, radix) {
    return parseInt(str, radix || 10);
}
exports.toInt = toInt;
;
function toBoolean(str, strict) {
    if (strict) {
        return str === '1' || str === 'true';
    }
    return str !== '0' && str !== 'false' && str !== '';
}
exports.toBoolean = toBoolean;
;
function equals(str, comparison) {
    return str === toString(comparison);
}
exports.equals = equals;
;
function contains(str, elem) {
    return str.indexOf(toString(elem)) >= 0;
}
exports.contains = contains;
;
function matches(str, pattern, modifiers) {
    if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
        pattern = new RegExp(pattern, modifiers);
    }
    return pattern.test(str);
}
exports.matches = matches;
;
function isEmail(str) {
    return email.test(str);
}
exports.isEmail = isEmail;
;
var default_url_options = {
    protocols: ['http', 'https', 'ftp'],
    require_tld: true,
    require_protocol: false
};
function isURL(str, options) {
    if (!str || str.length >= 2083) {
        return false;
    }
    options = merge(options, default_url_options);
    var url = new RegExp('^(?!mailto:)(?:(?:' + options.protocols.join('|') + ')://)' + (options.require_protocol ? '' : '?') + '(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:www.)?xn--)?(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + (options.require_tld ? '' : '?') + ')|localhost)(?::(\\d{1,5}))?(?:(?:/|\\?|#)[^\\s]*)?$', 'i');
    var match = str.match(url), port = match ? parseInt(match[1]) : 0;
    return match && (!port || (port > 0 && port <= 65535));
}
exports.isURL = isURL;
;
function isIP(str, version) {
    version = toString(version);
    if (!version) {
        return isIP(str, 4) || isIP(str, 6);
    }
    else if (version === 4) {
        if (!ipv4Maybe.test(str)) {
            return false;
        }
        var parts = str.split('.').sort();
        return parseInt(parts[3]) <= 255;
    }
    return version === 6 && ipv6.test(str);
}
exports.isIP = isIP;
;
function isAlpha(str) {
    return alpha.test(str);
}
exports.isAlpha = isAlpha;
;
function isAlphanumeric(str) {
    return alphanumeric.test(str);
}
exports.isAlphanumeric = isAlphanumeric;
;
function isSafeCharacters(str) {
    return safeCharacters.test(str);
}
exports.isSafeCharacters = isSafeCharacters;
;
function isNumeric(str) {
    return numeric.test(str);
}
exports.isNumeric = isNumeric;
;
function isHexadecimal(str) {
    return hexadecimal.test(str);
}
exports.isHexadecimal = isHexadecimal;
;
function isHexColor(str) {
    return hexcolor.test(str);
}
exports.isHexColor = isHexColor;
;
function isLowercase(str) {
    return str === str.toLowerCase();
}
exports.isLowercase = isLowercase;
;
function isUppercase(str) {
    return str === str.toUpperCase();
}
exports.isUppercase = isUppercase;
;
function isInt(str) {
    return int.test(str);
}
exports.isInt = isInt;
;
function isFloat(str) {
    return str !== '' && float.test(str);
}
exports.isFloat = isFloat;
;
function isDivisibleBy(str, num) {
    return toFloat(str) % num === 0;
}
exports.isDivisibleBy = isDivisibleBy;
;
function isNull(str) {
    return str.length === 0;
}
exports.isNull = isNull;
;
function isLength(str, min, max) {
    var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
    var len = str.length - surrogatePairs.length;
    return len >= min && (typeof max === 'undefined' || len <= max);
}
exports.isLength = isLength;
;
function isValidObjectID(str) {
    // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
    str = str.trim() + '';
    var len = str.length, valid = false;
    if (len == 12 || len == 24) {
        valid = /^[0-9a-fA-F]+$/.test(str);
    }
    return valid;
}
exports.isValidObjectID = isValidObjectID;
function isByteLength(str, min, max) {
    return str.length >= min && (typeof max === 'undefined' || str.length <= max);
}
exports.isByteLength = isByteLength;
;
function isUUID(str, version) {
    var pattern = uuid[version ? version : 'all'];
    return pattern && pattern.test(str);
}
exports.isUUID = isUUID;
;
function isDate(str) {
    return !isNaN(Date.parse(str));
}
exports.isDate = isDate;
;
function isAfter(str, date) {
    var comparison = toDate(date || new Date()), original = toDate(str);
    return original && comparison && original > comparison;
}
exports.isAfter = isAfter;
;
function isBefore(str, date) {
    var comparison = toDate(date || new Date()), original = toDate(str);
    return original && comparison && original < comparison;
}
exports.isBefore = isBefore;
;
function isIn(str, options) {
    if (!options || typeof options.indexOf !== 'function') {
        return false;
    }
    if (Object.prototype.toString.call(options) === '[object Array]') {
        var array = [];
        for (var i = 0, len = options.length; i < len; i++) {
            array[i] = toString(options[i]);
        }
        options = array;
    }
    return options.indexOf(str) >= 0;
}
exports.isIn = isIn;
;
function isCreditCard(str) {
    var sanitized = str.replace(/[^0-9]+/g, '');
    if (!creditCard.test(sanitized)) {
        return false;
    }
    var sum = 0, digit, tmpNum, shouldDouble;
    for (var i = sanitized.length - 1; i >= 0; i--) {
        digit = sanitized.substring(i, (i + 1));
        tmpNum = parseInt(digit, 10);
        if (shouldDouble) {
            tmpNum *= 2;
            if (tmpNum >= 10) {
                sum += ((tmpNum % 10) + 1);
            }
            else {
                sum += tmpNum;
            }
        }
        else {
            sum += tmpNum;
        }
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0 ? sanitized : false;
}
exports.isCreditCard = isCreditCard;
;
function isISBN(str, version) {
    version = toString(version);
    if (!version) {
        return isISBN(str, 10) || isISBN(str, 13);
    }
    var sanitized = str.replace(/[\s-]+/g, ''), checksum = 0, i;
    if (version === '10') {
        if (!isbn10Maybe.test(sanitized)) {
            return false;
        }
        for (i = 0; i < 9; i++) {
            checksum += (i + 1) * sanitized.charAt(i);
        }
        if (sanitized.charAt(9) === 'X') {
            checksum += 10 * 10;
        }
        else {
            checksum += 10 * sanitized.charAt(9);
        }
        if ((checksum % 11) === 0) {
            return sanitized;
        }
    }
    else if (version === '13') {
        if (!isbn13Maybe.test(sanitized)) {
            return false;
        }
        var factor = [1, 3];
        for (i = 0; i < 12; i++) {
            checksum += factor[i % 2] * sanitized.charAt(i);
        }
        if (sanitized.charAt(12) - ((10 - (checksum % 10)) % 10) === 0) {
            return sanitized;
        }
    }
    return false;
}
exports.isISBN = isISBN;
;
function isJSON(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isJSON = isJSON;
;
function isMultibyte(str) {
    return multibyte.test(str);
}
exports.isMultibyte = isMultibyte;
;
function isAscii(str) {
    return ascii.test(str);
}
exports.isAscii = isAscii;
;
function isFullWidth(str) {
    return fullWidth.test(str);
}
exports.isFullWidth = isFullWidth;
;
function isHalfWidth(str) {
    return halfWidth.test(str);
}
exports.isHalfWidth = isHalfWidth;
;
function isVariableWidth(str) {
    return fullWidth.test(str) && halfWidth.test(str);
}
exports.isVariableWidth = isVariableWidth;
;
function isSurrogatePair(str) {
    return surrogatePair.test(str);
}
exports.isSurrogatePair = isSurrogatePair;
;
function ltrim(str, chars) {
    var pattern = chars ? new RegExp('^[' + chars + ']+', 'g') : /^\s+/g;
    return str.replace(pattern, '');
}
exports.ltrim = ltrim;
;
function rtrim(str, chars) {
    var pattern = chars ? new RegExp('[' + chars + ']+$', 'g') : /\s+$/g;
    return str.replace(pattern, '');
}
exports.rtrim = rtrim;
;
function trim(str, chars) {
    var pattern = chars ? new RegExp('^[' + chars + ']+|[' + chars + ']+$', 'g') : /^\s+|\s+$/g;
    return str.replace(pattern, '');
}
exports.trim = trim;
;
function escape(str) {
    return (str.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;'));
}
exports.escape = escape;
;
function stripLow(str, keep_new_lines) {
    var chars = keep_new_lines ? '\x00-\x09\x0B\x0C\x0E-\x1F\x7F' : '\x00-\x1F\x7F';
    return blacklist(str, chars);
}
exports.stripLow = stripLow;
;
function whitelist(str, chars) {
    return str.replace(new RegExp('[^' + chars + ']+', 'g'), '');
}
exports.whitelist = whitelist;
;
function blacklist(str, chars) {
    return str.replace(new RegExp('[' + chars + ']+', 'g'), '');
}
exports.blacklist = blacklist;
;
function merge(obj, defaults) {
    obj = obj || {};
    for (var key in defaults) {
        if (typeof obj[key] === 'undefined') {
            obj[key] = defaults[key];
        }
    }
    return obj;
}
