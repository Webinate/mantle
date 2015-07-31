import express = require("express");
import controllerModule = require("./Controller");
import bodyParser = require('body-parser');
import * as request from "request"

export class EmailsController extends controllerModule.Controller
{
    private _usersURL: string;

	/**
	* Creates a new instance of the email controller
	* @param {express.Express} e The express instance of this server
	* @param {string} adminEmail The email for the admin of the site
	* @param {string} from The email we are sending messages from
	* @param {string} service The email service we are using. Eg: "Gmail"
	* @param {string} serviceUser The email service user name eg "user@gmail.com"
	* @param {string} servicePassword The email service password
	*/
    constructor(e: express.Express, usersURL: string )
	{
        super(null);

        this._usersURL = usersURL + "/users";

		var router = express.Router();
		router.use(bodyParser.urlencoded({ 'extended': true }));
		router.use(bodyParser.json());
		router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
		
		// Filter the post requests
		router.post("/", this.onPost.bind(this));
		
		// Register the path
		e.use("/api/message-admin", router);
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

        var message: string = `Hello admin,
			We have received a message from ${(<modepress.IMessage>req.body).name}:

			${(<modepress.IMessage>req.body).message}

			Email: ${(<modepress.IMessage>req.body).email}
			Phone: ${(<modepress.IMessage>req.body).phone}
			Website: ${(<modepress.IMessage>req.body).website}
		`;

        request.post(`${this._usersURL}/message-webmaster`, { form: { message: message } }, function(error, response, body)
        {
            if (error)
                return res.end(JSON.stringify(<UsersInterface.IResponse>{ message: error.toString(),  error: true }));
            
            res.end(body);
        });
	}
}