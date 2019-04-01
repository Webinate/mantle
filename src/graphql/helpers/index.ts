import { IAuthReq } from '../../types/tokens/i-auth-request';
import Factory from '../../core/controller-factory';
import { ServerResponse } from 'http';
import { IUserEntry } from '../../types/models/i-user-entry';

export async function getAuthUser(req: IAuthReq, res: ServerResponse) {
  const session = await Factory.get('sessions').getSession(req);
  const toRet: { user?: IUserEntry<'server'>; isAdmin?: boolean } = { isAdmin: false };

  if (session) {
    await Factory.get('sessions').setSessionHeader(session, req, res);
    toRet.user = session.user;
    toRet.isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';
  }

  return toRet;
}
