import { printSchema } from 'graphql';
import { writeFileSync } from 'fs';
import { buildSchema } from 'type-graphql';
import { CategoryResolver } from '../graphql/resolvers/category-resolver';

export async function generateSchema() {
  const schema = await buildSchema({
    resolvers: [CategoryResolver]
  });

  return schema;
}

export async function writeSchemaToFile(file: string) {
  const schema = await generateSchema();
  writeFileSync(file, printSchema(schema), 'utf8');
}
