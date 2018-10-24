import { Db } from 'mongodb';
import { ITemplate } from '../../types/models/i-template';

export async function loadTemplates( db: Db ) {
  const templates: Partial<ITemplate<'server'>>[] = [ {
    name: 'Simple Post',
    description: 'A simple post with a single column',
    defaultZone: 'main',
    zones: [ 'main' ]
  }
  ];
  const collection = await db.collection( 'templates' );

  // Remove all templates
  await collection.remove( {} );

  // Now add each of the templates
  for ( const template of templates )
    await collection.insertOne( template );
}