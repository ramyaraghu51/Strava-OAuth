/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/

const path = require("path");
const url = require('url');
var ClientOAuth2 = require('client-oauth2');
const axios = require('axios');
const https = require('https');
const daily_steps_limit=6999;



const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
const activities_link = "https://www.strava.com/api/v3/athlete/activities"
 
// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE


// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}



fastify.get("/callback", function(request, reply) {
  const queryObject = url.parse(request.url,true).query;
  console.log(queryObject);
  
 let successful_days={};
  
  let params = { 
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: queryObject.code,
    access_token: "x",
    refresh_token: "x",
    strava_rsp: "",
    successful_steps:"x",
    limit:daily_steps_limit
    
  }
  
  console.log(STRAVA_TOKEN_URL+ "?client_id="+ params.client_id+ "&client_secret="+ params.client_secret+"&code="+ params.code+ "&grant_type=authorization_code"); 
              
  axios({
    // make a POST request
    method: 'post',
    url: STRAVA_TOKEN_URL+ "?client_id="+ params.client_id+ "&client_secret="+ params.client_secret+"&code="+ params.code+ "&grant_type=authorization_code",
    headers: {
         accept: 'application/json'
    }
  })
  .then((response) => {
    if (response.status >= 400 && response.status < 600) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data
  })
  .then(respdata => 
  {
    console.log(respdata.access_token)
    params["access_token"] = respdata.access_token
    params["refresh_token"] = respdata.refresh_token
    params["strava_rsp"] = JSON.stringify(respdata, null, 2)

    axios({
      method:'get',
      url: activities_link+ "?access_token="+respdata.access_token  
    }) 
    .then(response => 
    {
        var dailydata = {}
        
        response.data.forEach((activity) => {
          var date=activity['start_date'].substring(0,10) 
          var steps = Math.round(activity['distance'] * 1.3120) //fancy logic to convert meters to steps
          if (date in dailydata)
            dailydata[date] += steps
          else
            dailydata[date] = steps
        });
        console.log(dailydata)
        for (var date in dailydata)
        {
          if(dailydata[date]>daily_steps_limit){
            successful_days[date] = dailydata[date]
          }
            
        }
        params["dailysteps"] = JSON.stringify(dailydata)
        params["successful_steps"] = JSON.stringify(successful_days)
        reply.view("/src/pages/callback.hbs", params);
    });
  })
  .catch( err => console.log("some error:" + err))
  });
  
/**
* Our home page route
*
* Returns src/pages/index.hbs with data built into it
*/
fastify.get("/", function(request, reply) {
  
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  
  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    
    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", params);
});

/**
* Our POST route to handle and react to form submissions 
*
* Accepts body data indicating the user choice
*/
fastify.post("/", function(request, reply) {
  
  // Build the params object to pass to the template
  let params = { seo: seo };
  
  // If the user submitted a color through the form it'll be passed here in the request body
  let color = request.body.color;
  
  // If it's not empty, let's try to find the color
  if (color) {
    // ADD CODE FROM TODO HERE TO SAVE SUBMITTED FAVORITES
    
    // Load our color data file
    const colors = require("./src/colors.json");
    
    // Take our form submission, remove whitespace, and convert to lowercase
    color = color.toLowerCase().replace(/\s/g, "");
    
    // Now we see if that color is a key in our colors object
    if (colors[color]) {
      
      // Found one!
      params = {
        color: colors[color],
        colorError: null,
        seo: seo
      };
    } else {
      
      // No luck! Return the user value as the error property
      params = {
        colorError: request.body.color,
        seo: seo
      };
    }
  }
  
  // The Handlebars template will use the parameter values to update the page with the chosen color
  reply.view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});