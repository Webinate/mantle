declare module 'modepress' {
  export interface IAuthOptions extends IBaseControler {

    /**
     * The URL to redirect to after the user attempts to activate their account.
     * User's can activate their account via the '/activate-account' URL, and after its validation the server will redirect to this URL
     * adding a query ?message=You%20have%20activated%20your%20account&status=success.
     * The status can be either 'success' or 'error'
     *
     * eg: 'http://localhost/auth/notify-user'
     */
    accountRedirectURL: string;

    /**
     * The URL sent to users emails for when their password is reset. This URL should
     * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
     *
     * eg: 'http://localhost/auth/reset-password'
     */
    passwordResetURL: string;

    /**
     * The URL sent to users emails for when they need to activate their account
     *
     * eg: 'http://localhost/auth/activate-account
     */
    activateAccountUrl: string;
  }
}