const Redis = require("redis");
const JSONCache = require("redis-json");

const { REDIS_PORT, SERVER_ADDRESS } = require("../redisConfig");

//Setting up the redis client
const redis = Redis.createClient({
  host: SERVER_ADDRESS,
  port: REDIS_PORT,
  // put other options here, if required
});

const jsonCache = new JSONCache(redis, { prefix: "cache:" });

const setJson = async ({ json_key_name, objectData, expire = null }) => {
  try {
    if (expire !== null && expire !== undefined) {
      await jsonCache.set(json_key_name, objectData, { expire });
    } else {
      await jsonCache.set(json_key_name, objectData);
    }
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// keys should be an array of strings of the keys that are required ['name', 'age', 'address.pin']
const getJson = async ({ json_key_name, keys = [] }) => {
  let jsonData = await jsonCache.get(json_key_name, ...keys);

  if (jsonData !== null || jsonData !== undefined) {
    return jsonData;
  } else {
    return null;
  }
};

const deleteJson = async (key_name) => {
  try {
    await jsonCache.del(key_name);
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { getJson, setJson, deleteJson };
