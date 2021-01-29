const express = require("express");
const axios = require("axios");
const { getJson, setJson, deleteJson, setExpiry } = require("./utils");

const PORT = 5000;

const app = express();

//Make requrest to jsonPlaceholder API for data
async function getSomeData(req, res) {
  try {
    console.log("Fetching data...");

    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/users`
    );

    //Set data to Redis
    await setJson({
      json_key_name: "users",
      jsonData: JSON.stringify(response.data),
    });

    return res.send("Success");
  } catch (err) {
    console.error(err);
    return res.status(500).write("Server Error!");
  }
}

//Cache middleware
async function cache(req, res, next) {
  try {
    //await deleteJson({ json_key_name: "users" });
    //fetch the data item from redis cache whose key = username
    //If the data item is not already present in the redis cache, it will return null

    const dataFetchedFromCache = await getJson({ json_key_name: "users" });

    //If the data is found, return the response right away
    if (dataFetchedFromCache !== null) return res.send(dataFetchedFromCache);
  } catch (err) {
    console.error(err);
  }
  next(); //If the data is not present in redis, call the getSomeData function
}

app.get("/users", cache, getSomeData);

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
