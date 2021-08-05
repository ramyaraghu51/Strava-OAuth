# Strava!

This project includes a Node.js server script and a web page that connects to it. The front-end page presents two options to Login with Strava and Login with Fitbit, sending the authorization code to the back-end API running on the server. The server requests the "https://www.strava.com/oauth/token" 🎨 and receives the access token,refresh token pair.With the access token received from the JSON response,the server requests "https://www.strava.com/api/v3/athlete/activities" to get the activities of the user.

[Node.js](https://nodejs.org/en/about/) is a popular runtime that lets you run server-side JavaScript. This project uses the [Fastify](https://www.fastify.io/) framework and explores basic templating with [Handlebars](https://handlebarsjs.com/).

## How to run this project?
Download the folder to the desired IDE.
  Run npm install in the command prompt to install the necessary packages.
  Run npm run start to view the application locally.
  A running example of this project can be found at https://tricky-potent-peach.glitch.me/



## What's in this project?

← `README.md`: That’s this file, where you can tell people what your cool website does and how you built it.

← `public/style.css`: The styling rules for the pages in your site.

← `server.js`: The **Node.js** server script for your new site. The JavaScript defines the endpoints in the site back-end, one to return the homepage index .hbs and another file callback.hbs. Each one sends data to a Handlebars template which builds these parameter values into the web page the visitor sees.

← `package.json`: The NPM packages for the project's dependencies.

← `src/`: This folder holds the site template along with some basic data files.


← 'bundle.js': This page contains the source code for calendar implementation. Futher this page parses the JSON response and displays it in a calendar.
← 'src/pages/index.hbs':  This is the main page template for your site. The template receives parameters from the server script, which it includes in the page HTML.The page sends the authorization code as a query parameter to the callback.hbs page.

← callback.hbs


