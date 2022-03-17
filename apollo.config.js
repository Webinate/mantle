module.exports = {
  client: {
    includes: ['./src/**/*.{ts,tsx}', './test/**/*.{ts,tsx}'],
    service: {
      name: 'oc-schema',
      localSchemaFile: './schema.graphql'
    }
  }
};
