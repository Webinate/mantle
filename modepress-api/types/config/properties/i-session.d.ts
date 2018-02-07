export interface ISession {
    path: string;
    /**
     * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
     * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
     * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
     */
    domain: string;
    /**
     * A persistent connection is one that will last after the user closes the window and visits the site again (true).
     * A non-persistent that will forget the user once the window is closed (false)
     */
    persistent: boolean;
    /**
     * If true, the cookie will be encrypted
     */
    secure: boolean;
    /**
     * If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
     * The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
     * By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
     */
    lifetime: number;
}
