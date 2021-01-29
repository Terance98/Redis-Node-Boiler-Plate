const redis = require("redis");
const rejson = require("redis-rejson");
const { REDIS_PORT, SERVER_ADDRESS } = require("../redisConfig");

const { promisify } = require("util");

/**********************************************
 *
 * This requires RedisJSON module installed on your redis server to work
 *
 * https://oss.redislabs.com/redisjson/#download-and-running-binaries
 *
 **********************************************/

rejson(redis); /* important - this must come BEFORE creating the client */

//Setting up the redis client
const client = redis.createClient({
  host: SERVER_ADDRESS,
  port: REDIS_PORT,
  // put other options here, if required
});

/*
  The following code performs promisification of the redis operations
  Make a global set of all the fuctions required inorder to use it in a promise based method.
  */

const setJsonAsync = promisify(client.json_set).bind(client);
const getJsonAsync = promisify(client.json_get).bind(client);
const delJsonAsync = promisify(client.json_del).bind(client);
const setExpiryAsync = promisify(client.expire).bind(client);
const setExpireAtAsync = promisify(client.expireat).bind(client);

const setJson = async ({ json_key_name, key_path = ".", jsonData }) => {
  try {
    await setJsonAsync(json_key_name, key_path, jsonData);
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// Since expiry can't be set using json.set, use this function instead
// expireAt should be UNIX time

const setExpiry = async ({
  json_key_name,
  expire_time,
  isExpireAt = false,
  expireAt,
}) => {
  try {
    if (isExpireAt) {
      await setExpireAtAsync(json_key_name, expireAt);
      return true;
    } else {
      await setExpiryAsync(json_key_name, time);
      return true;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getJson = async ({ json_key_name, key_path = "." }) => {
  let jsonData = await getJsonAsync(json_key_name, key_path);

  if (jsonData !== null || jsonData !== undefined) {
    return jsonData;
  } else {
    return null;
  }
};

const deleteJson = async ({ json_key_name, key_path = "." }) => {
  try {
    await delJsonAsync(json_key_name, key_path);
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { getJson, setJson, deleteJson, setExpiry };
