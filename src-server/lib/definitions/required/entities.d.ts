/** Definitions for https://github.com/fb55/entities */

declare module "entities"
{
	export function encodeHTML(input: string): string;
	export function encodeXML(input: string): string;
	export function decodeXML(input: string): string;
	export function decodeHTML(input: string): string;
}