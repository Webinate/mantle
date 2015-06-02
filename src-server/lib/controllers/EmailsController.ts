import express = require("express");
import controllerModule = require("./Controller");
import bodyParser = require('body-parser');
import nodemailer = require('nodemailer');

export class EmailsController extends controllerModule.Controller
{
	private _transport: Transport;
	private _from: string;
	private _adminEmail: string;

	/**
	* Creates a new instance of the email controller
	* @param {express.Express} e The express instance of this server
	* @param {string} adminEmail The email for the admin of the site
	* @param {string} from The email we are sending messages from
	* @param {string} service The email service we are using. Eg: "Gmail"
	* @param {string} serviceUser The email service user name eg "user@gmail.com"
	* @param {string} servicePassword The email service password
	*/
	constructor(e: express.Express, adminEmail: string, from: string = "", service: string = "Gmail", serviceUser: string = "", servicePassword: string = "")
	{
		super(null);

		var router = express.Router();
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
		
		// Filter the post requests
		router.post("/", this.onPost.bind(this));
		
		// Register the path
		e.use("/api/message-admin", router);

		this._from = from;
		this._adminEmail = adminEmail;

		// Create the transport object which will be sending the emails
		if (service != "" && serviceUser != "" && servicePassword != "" )
			this._transport = nodemailer.createTransport({
				service: service,
				auth: {
					user: serviceUser,
					pass: servicePassword
				}
			});
	}
	
	/**
	* Called whenever a post request is caught by this controller
	* @param {express.Request} req The request object
	* @param {express.Response} res The response object
	* @param {Function} next
	*/
	protected onPost(req: express.Request, res: express.Response, next: Function): any 
	{
		// Set the content type
		res.setHeader('Content-Type', 'application/json');

		if (!this._transport)
		{
			return res.end(JSON.stringify({
				message: `There is no email service set for this website`,
				error: true
			}));
		}
		
		var message : string = `Hello admin,
			We have received a message from ${(<modepress.IMessage>req.body).name}:

			${(<modepress.IMessage>req.body).message}
			
			Email: ${(<modepress.IMessage>req.body).email}
			Phone: ${(<modepress.IMessage>req.body).phone}
			Website: ${(<modepress.IMessage>req.body).website}
		`;

		var adminEmail: string = this._adminEmail;

		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: this._from,
			to: adminEmail,
			subject: "Webinate Message",
			text: message,
			html: message.replace(/(?:\r\n|\r|\n)/g, '<br />')
		};

		// send mail with defined transport object
		this._transport.sendMail(mailOptions, function (error, info)
		{
			if (error)
			{
				res.end(JSON.stringify({
					message: `We could not send an email to the admin at ${adminEmail}. Error: ${error.message}`,
					error: true
				}));
			}
			else
			{
				res.end(JSON.stringify({
                    message: `Thank you for email ${(<modepress.IMessage>req.body).name}, we'll get in touch as soon as we can`,
					error: false
				}));
			}
		});
	}
}