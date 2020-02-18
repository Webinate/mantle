import { printSchema } from 'graphql';
import { writeFileSync } from 'fs';
import { buildSchema } from 'type-graphql';

export async function generateSchema() {
  const schema = await buildSchema({
    resolvers: []
  });

  return schema;
}

export async function writeSchemaToFile(file: string) {
  const schema = await generateSchema();
  writeFileSync(file, printSchema(schema), 'utf8');
}
