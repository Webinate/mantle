import { Db } from 'mongodb';
import { ITemplate } from '../../types/models/i-template';

export async function loadTemplates( db: Db ) {
  const templates: Partial<ITemplate<'server'>>[] = [ {
    name: 'Simple Post',
    description: 'A simple page layout with a single column',
    defaultZone: 'main',
    zones: [ 'main' ]
  }, {
    name: 'Double Column',
    description: 'A two column page layout',
    defaultZone: 'left',
    zones: [ 'left', 'right' ]
  } ];

  const collection = await db.collection( 'templates' );

  // Remove all templates
  await collection.remove( {} );

  // Now add each of the templates
  for ( const template of templates )
    await collection.insertOne( template );
}