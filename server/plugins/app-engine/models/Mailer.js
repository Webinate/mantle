var nodemailer = require("nodemailer");
/**
* Use this class to send emails using SMPT
*/
var Mailer = (function () {
    function Mailer() {
        this._smpt = nodemailer.createTransport("SMTP", {
            secureConnection: true,
            service: "Gmail",
            auth: {
                user: "mat@webinate.net",
                pass: "raptors123!"
            }
        });
    }
    /**
    * Sends an email using the mail transporter
    */
    Mailer.prototype.sendEmail = function (message, callback) {
        this._smpt.sendMail(message, callback);
    };
    /**
    * @returns {Mailer}
    */
    Mailer.getSingleton = function () {
        if (!Mailer._singleton)
            Mailer._singleton = new Mailer();
        return Mailer._singleton;
    };
    return Mailer;
})();
module.exports = Mailer;
