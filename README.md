## Guest Book


An online guestbook where you can leave people messages, edit those messages or delete them. The frontend was built using ReactJS and the backend was build using Nodejs ExpressJS.

## Project Status

The project is only missing the reply feature, it is still in development.

## Installation and Setup Instructions

#### Example:  

1) Clone down this repository. You will need `node` and `npm` installed globally on your machine.

2) Clone the frontend repository: "https://github.com/alisadek/guestbook-frontend"

Installation:
  
3) Run two terminals.


4) In the first terminal, go to the directory where you cloned the backend (this repository).

5) Install any the required packages.

`npm install`

6) To Start Server:

`npm start`  

7) In the second terminal, go to the directory where you cloned the frontend.

8) Repeat steps 5 and 6.

9) Project should start.

To Visit App Directly:

`localhost:3000/`  

## Key Features
Users Can:
- Register
- Login (after Authentication). Login uses tokens for users to remain signed in and get signed out after token expires (1 hour).
- Write new comments (only while logged in).
- Edit comments (Only the ones they wrote).
- Delete comments (Only the ones they wrote).

Backend contains:
- REST APIs for fetching comments, editting and deleting them.
- Authentication (using hashing method).
- Error Handling.

## Reflection  

This was a 4 day long project built as a coding challenge.   

I was asked to build an application that allowed users to write messages, edit those messages and delete them. In order to be able to write or edit messages you need to login. I started this process by using the `create-react-app` boilerplate, then adding `react-router-dom`.

Let's get one thing out of the way before anything, the design "less than perfect" because I was not able to use libraries which meant I had to write the CSS which is not really my area of expertise, it probably would've looke a lot better if I could use BootStrap or Material-UI.
I found it really challenging to finish this project in the required time without the use of any libraries or 3rd party frameworks. One of the main challengs I ran into was Authentication. I have done authentication in the past using "passport" package which makes it really easy to even configure OAuth but since that wasn't an option I had to figure out how to do it manually. Also adding the edit feature and making it edit the actual comments in the Database and having the user not feel any issue (the comment changing place or missing the previous text) was quite challenging. Due to project time constraints, I was not able to implement the reply feature because it would have taken one more day at least.

At the end of the day, I was able to use (ReactJS, ExpressJS, Node, and MongoDB) to create this project and I was able to brush up on my basic CSS.

## Things I would add with packages:

- OAuth using Google and Facebook signin.
- Styling (a huuuge difference).
- Reply  (well maybe not with a package).
- Input Validation (I could've done that without a package but it would have taken a lot more time and I was already late).
