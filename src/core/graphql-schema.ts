import { printSchema } from 'graphql';
import { writeFileSync } from 'fs';
import { buildSchema, AuthChecker } from 'type-graphql';
import { CategoryResolver } from '../graphql/resolvers/category-resolver';
import ControllerFactory from './controller-factory';
import { UserPrivilege } from './enums';
import { IGQLContext } from '../types/interfaces/i-gql-context';

export async function generateSchema() {
  const schema = await buildSchema({
    resolvers: [CategoryResolver],
    authChecker: customAuthChecker
  });

  return schema;
}

export const customAuthChecker: AuthChecker<IGQLContext> = async ({ root, args, context, info }, roles) => {
  const selectedRoles: UserPrivilege[] = roles as UserPrivilege[];

  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  const session = await ControllerFactory.get('sessions').getSession(context.req);

  if (!session) return false;
  if (session) await ControllerFactory.get('sessions').setSessionHeader(session, context.req, context.res);
  if (session.user.privileges === 'super') return true;
  if (session.user.privileges === 'admin' && selectedRoles.includes('admin')) return true;

  return false; // or false if access is denied
};

export async function writeSchemaToFile(file: string) {
  const schema = await generateSchema();
  writeFileSync(file, printSchema(schema), 'utf8');
}
