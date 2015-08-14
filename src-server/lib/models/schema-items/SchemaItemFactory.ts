import * as numbers from "./SchemaNumber";
import {SchemaText} from "./SchemaText";
import {SchemaBool} from "./SchemaBool";
import {SchemaDate} from "./SchemaDate";
import {SchemaTextArray} from "./SchemaTextArray";
import {SchemaId} from "./SchemaId";

export var NumberType = numbers.NumberType;
export var num = numbers.SchemaNumber;
export var text = SchemaText;
export var textArray = SchemaTextArray;
export var date = SchemaDate;
export var bool = SchemaBool;
export var id = SchemaId;