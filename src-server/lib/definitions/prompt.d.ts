//// Created by Mathew Henson
//// Project: https://github.com/flatiron/prompt

///// <reference path="./node.d.ts" />

//declare module "prompt"
//{
//    import express = require('express');

//	type PromtSchema = {
//		description?: string;
//		type?: string;
//		pattern?: RegExp;
//		message?: string;
//		hidden?: boolean;
//		default?: string;
//		required?: boolean;
//		conform?: (input: any) => boolean
//	};

//	/**
//	* Starts the prompt by listening to the appropriate events on `options.stdin`
//	* and `options.stdout`. If no streams are supplied, then `process.stdin`
//	* and `process.stdout` are used, respectively.
//	*/
//    export function start(options?: { memory?: number; allowEmpty?: boolean; message?: string; delimiter?: string; colors?: boolean; stdin?: any; stdout?: any; });

//	/**
//	* Pauses input coming in from stdin
//	*/
//	export function get(schema?: Array<string|PromtSchema>|PromtSchema|string, callback?: (err, result) => void );

//	/**
//	* Pauses input coming in from stdin
//	*/
//	export function pause();

//	/**
//	* Resumes input coming in from stdin
//	*/
//	export function pause();

//	/**
//	* Returns the `property:value` pair from within the prompts
//	* @param {number|string}  search Index or property name to find.
//	*/
//	export function history(search?: string | number): { property: any; value: string};
//}