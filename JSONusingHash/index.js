const express = require("express");
const axios = require("axios");
const { getJson, setJson, deleteJson } = require("./utils");

const PORT = 5005;

const app = express();

//Make requrest to jsonPlaceholder API for data
async function getSomeData(req, res) {
  try {
    console.log("Fetching data...");

    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts`
    );

    //Set data to Redis
    if (response && response.data) {
      response.data.map(async (post) => {
        await setJson({
          objectName: `post:${post.id}`,
          objectData: post,
          expire: 100,
        });
      });
    }

    return res.send("Success");
  } catch (err) {
    console.error(err);
    return res.status(500).write("Server Error!");
  }
}

//Cache middleware
async function cache(req, res, next) {
  try {
    //fetch the data item from redis cache whose key = username
    //If the data item is not already present in the redis cache, it will return null

    const dataFetchedFromCache = await getJson({
      objectName: `post:${2}`,
    });

    //If the data is found, return the response right away
    if (dataFetchedFromCache !== null && dataFetchedFromCache !== undefined)
      return res.send(JSON.stringify(dataFetchedFromCache));
  } catch (err) {
    console.error(err);
  }
  next(); //If the data is not present in redis, call the getSomeData function
}

app.get("/posts", cache, getSomeData);

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
