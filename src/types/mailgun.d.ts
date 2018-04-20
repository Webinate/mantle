// Created by: Mathew Henson
// Based on the library here: https://github.com/bojand/mailgun-js
// A very basic definition which hopefully will get its own typings: https://github.com/bojand/mailgun-js/issues/100

declare namespace MailGun {
  export interface Mailer {
    send( data: {
      from: string,
      to: string,
      subject: string,
      text: string,
      attachment?: string
    }, callback: ( error: Error, body: any ) => void ): void;
  }

  /**
   * An instance of the mailgun api
   */
  export interface Instance {
    messages(): Mailer;
  }

  /**
   * Options for setting up the mailgun instance
   */
  export interface MailgunOptions {
    apiKey: string;
    domain: string;
  }

  let init: ( options: MailgunOptions ) => Instance;
}

declare module 'mailgun-js' {
  export = MailGun.init;
}