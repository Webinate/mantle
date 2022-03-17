Users & Authentication
===============
Mantle is built with a set of endpoints for dealing with users, authentication and user media. This was originally treated
as a separate project but was later moved back into Mantle because of its integral nature to the project.


## Installation
[An existing setup guide was created here](./users-installation.md)

## Setting up the Google services
[Setup Google Developer Settings & Services](google-setup.md)

## Socket API
Users has some basic support for websockets that are used to communicate events and other services to approved clients.
You can find out more information from [here](./users-ws-api.md)

## REST Functions
Below is a list of function calls you can make once the server is running. Each call returns a JSON
object. Calls can be made from both a client browser or server, though some requests will require
the caller to be authenticated.


### Authenticated

Checks to see if a user is logged in. If the user is logged in, then their details will be sent back in the 'user' field.
By default the information of the user that is returned is obscured. You can turn this off
by adding the *verbose=true* query parameter. The verbose parameter will only be respected for admin users and if the
user making the call is the same as the user's details being requested.

    `/auth/authenticated`

**Request Type: GET**

**Parameters**
* verbose - If true, sensitive data will not be obscured. This will only work for admin users.

**Examples**
```
http://localhost:8000/api/auth/authenticated

{
	message: "User is authenticated",
	authenticated: true,
	error: false,
	user: {
		_id: "7840fen39f38fj8384f73j",
		email: "test@test.net",
		lastLoggedIn: 1432114922204,
		username: "test",
		privileges: 'super'
	}
}
```

### Login

Attempts to log the user in with the provided credentials

    `/auth/login`

**Request Type: POST**

**Parameters**
* username - The username of the user
* password - The password of the user
* rememberMe - True if the login state should persist.

**Examples**
```
http://localhost:8000/api/auth/login

{
	message: "User is authenticated",
	authenticated: true,
	error: false
}
```


### Logout

Attempts to log out the current user. This removes the user's session and they will have to login again to be authenticated.

    `/auth/logout`

**Request Type: GET**

**Examples**
```
http://localhost:8000/api/auth/logout

{
	message: "Successfully logged out",
	error: false
}
```


### Get Specific User

*You must be logged in to make this call.*
Fetches a specific user from the database. By default the information returned is obscured. You can turn this off
by adding the *verbose=true* query parameter. The verbose parameter will only be respected for admin users and if the
user making the call is the same as the user's details being requested.

    `/users/:username`

**Request Type: GET**

**Parameters**
* username - The username or email of the user to get
* verbose - If true, sensitive data will not be obscured. This will only work for admin users.

**Examples**
```
http://localhost:8000/api/users/test // Gets the user with the username test
http://localhost:8000/api/users/test?verbose=true // Gets the user with the username test and does not obscure the sensitive data

{
	error: false,
	message: "Found user test",
	data: {
		_id: "57gjdn85738fj57fj57f84j4",
		email: "test@test.net",
		lastLoggedIn: 1432114922204,
		username: "test",
		privileges: 'regular'
	}
}
```



### Get Users
*You must be logged in to make this call.* By default the information returned is obscured. You can turn this off
by adding the *verbose=true* query parameter. The verbose parameter will only be respected for admin users. You
also narrow down the results with the other parameters listed below.

    `/users`

**Request Type: GET**

**Parameters**
* index - Specify the index to start the fetch from
* limit - Specify the number of entries to fetch
* search - Specify a term that either the email or username must contain. eg 'mat' will return users with the username or email containing the term 'mat'
* verbose - If true, sensitive data will not be obscured

**Example calls**
```
http://localhost:8000/api/users // Gets all users
http://localhost:8000/api/users?index=0&limit=4 // Gets up to 4 users from index 0
http://localhost:8000/api/users?search=test // Gets all users with the username or email containing 'test'
http://localhost:8000/api/users?search=test&limit=4 // Gets up to 4 users with the username or email containing 'test'
http://localhost:8000/api/users?search=test&limit=4&index=1 // Gets up to 4 users from index 1 whose username or email contains 'test'
http://localhost:8000/api/users?verbose=true // If verbose, sensitive data will not be obscured

{
	error: false,
	message: "Found 4 users",
	count: 5,
	data: [
		0: {
			_id: "57gjdn85738fj57fj57f84j4",
			email: "test@test.net",
			lastLoggedIn: 1432114922204,
			username: "test",
			privileges: 'regular'
		}
	]
}
```



### Approve Activation
*You must be logged in as an admin to make this call.*
Approves a user's activation code so they can login without email validation. Usually after a user logs in
they have to click a link to activate their account. This function allows you to approve a user without them
doing that.

    `/auth/approve-activation/:user`

**Request Type: PUT**

**Parameters**
* user - The username of email of the user to activate

**Example calls**
```
http://localhost:8000/api/users/mat/auth/approve-activation // Activates the account with the username "mat"

{
	error: false,
	message: "User's email has been activated"
}
```




### Register
Attempts to register a new user. This process will create a new user and send them an email with intructions
on how to activate their account

    `/auth/register`

**Request Type: POST**

**Parameters**
* username - The username of the user
* password - The users secret password
* email - The users email address
* captcha - The captcha value the user guessed
* challenge - The captcha challenge

**Example calls**
```
http://localhost:8000/api/auth/register // Activates the account with the username "mat"

{
	error: false,
	authenticated: true,
	message: "Please activate your account with the link sent to your email address"
}
```


### Create User
*You must be logged in as an admin to make this call*
Attempts to create a new user - circumventing registration.
This process will create a new user and send them an email with intructions on how to activate their account.

    `/create-user`

**Request Type: POST**

**Parameters**
* username - The username of the user
* password - The users secret password
* email - The users email address

**Example calls**
```
http://localhost:8000/api/create-user // Activates the account with the username "mat"

{
	error: false,
	authenticated: true,
	message: "User created"
	data: {
		_id: "57gjdn85738fj57fj57f84j4",
		email: "test@test.net",
		lastLoggedIn: 1432114922204,
		username: "test",
		privileges: 'regular'
	}
}
```



### Remove User
*You must be logged in as an admin to make this call OR the user making the request is the same as the one being removed.
You cannot remove super users.*
Attempts to delete a user and their details from the server

    `/remove-user/:user`

**Request Type: DELETE**

**Parameters**
* user - The username or email of the user

**Example calls**
```
http://localhost:8000/api/users/mat/remove-user // Removes the account with the username "mat"

{
	error: false,
	message: "User has been removed"
}
```



### Resend Activation Link
Resends the activation link to the user

    `/auth/resend-activation/:user`

**Request Type: GET**

**Parameters**
* user - The username or email of the user

**Example calls**
```
http://localhost:8000/api/auth/resend-activation/mat // Sends an activation link to the user with the username "mat".
{
	error: false,
	message: "An activation link has been sent, please check your email for further instructions"
}
```



### Activation User Account
Activates the user's account. After this function is called the server redirects the page to config.accountRedirectURL

    `/auth/activate-account`

**Request Type: GET**

**Parameters**
* user - The username or email of the user
* key - The key that was generated on register or from a new activation link

**Example calls**
```
http://localhost:8000/api/auth/activate-account

REDIRECTS THE PAGE TO  config.accountRedirectURL WITH THE QUERY PARAMS
message=Your%20account%20is%20activated
status=error    OR    status=success
```



### Request Password Reset
Sends a password reset link the user's email and generates a password key that must be used when the passwordReset function is called.
The link generated is config.passwordResetURL with "key" and "user" query parameters. So if the passwordResetURL is 127.0.0.1 then
the link would be something like 127.0.0.1?key=sdgthdf&user=mat

    `/auth/request-password-reset/:user`

**Request Type: GET**

**Parameters**
* user - The username or email of the user

**Example calls**
```
http://localhost:8000/api/auth/request-password-reset/mat // Sends a password reset for the user with the username "mat".
{
	error: false,
	message: "Instructions have been sent to your email on how to change your password"
}
```




### Password reset
Attempts to reset a user's password. This function requires you send the password change token which
is sent to the user's email.

    `/auth/password-reset`

**Request Type: GET**

**Parameters**
* user - The username or email of the user
* key - The password key that was generated by the requestPasswordReset and sent to the user
* password - The new password

**Example calls**
```
http://localhost:8000/api/auth/password-reset // Removes the account with the username "mat"

REDIRECTS THE PAGE TO config.passwordRedirectURL WITH THE QUERY PARAMETERS
message="It was a success"
status="error"  OR  status="success"
```