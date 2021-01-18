const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const { promisify } = require("util");

const PORT = 5000;
const REDIS_PORT = 6379;
const SERVER_ADDRESS = "127.0.0.1";

//Setting up the redis client
const client = redis.createClient({
  host: SERVER_ADDRESS,
  port: REDIS_PORT,
//   password: "your password", // replace with your password
});

const app = express();

/*
  The following code performs promisification of the redis operations
  Make a global set of all the fuctions required inorder to use it in a promise based method.
  */
const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

//Response function
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} GitHub repos</h2>`;
}

//Make requrest to Github for data
async function getRepos(req, res) {
  try {
    console.log("Fetching data...");

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();

    const repos = data.public_repos;

    //Set data to Redis
    await setexAsync(username, 3600, repos);

    return res.send(setResponse(username, repos));
  } catch (err) {
    console.error(err);
    return res.status(500).write("Server Error!");
  }
}

//Cache middleware
async function cache(req, res, next) {
  const { username } = req.params;

  try {
    //fetch the data item from redis cache whose key = username
    //If the data item is not already present in the redis cache, it will return null
    const dataFetchedFromCache = await getAsync(username);

    //If the data is found, return the response right away
    if (dataFetchedFromCache !== null)
      return res.send(setResponse(username, dataFetchedFromCache));
  } catch (err) {
    console.error(err);
  }
  next(); //If the data is not present in redis, call the getRepos function
}

app.get("/repos/:username", cache, getRepos);

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});

/*
HASH MAP IMPLEMENTATION OF REDIS

    //A sample object with key value pairs
    const obb = {
        id: "user001",
        first_name: "Skippy",
        last_name: "C",
        email: "skippy@c.com",
        phone: 2133141,
    };

  const { id, first_name, last_name, email, phone } = obb;

  //setting the data with key as id, then the key value pairs as array items
  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    function (err, data) {
      if (err) throw err;

      if (data != null) {
        res.send(setResponse(username, data));
      } else {
        next();
      }
    }
  );

  //getting all the key value pairs by key ( which is id here )
  client.hgetall(id, function (err, obj) {
    if (!obj) {
      console.error(err);
    } else {
      obj.id = id;
      console.log(obj);
      next();
    }
  });
  
  //Deleting the item by passing in the id
  client.del(id, next());

*/
