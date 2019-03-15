/**
 * Checks a string to see if its a valid mongo id
 * @param str
 * @returns True if the string is valid
 */
export function isValidObjectID(str: string = ''): boolean {
  // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
  str = str.trim() + '';
  let len = str.length,
    valid = false;
  if (len === 12 || len === 24) valid = /^[0-9a-fA-F]+$/.test(str);

  return valid;
}

/**
 * Generates a random string
 * @param len The size of the string
 */
export function generateRandString(len: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
