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

const setJson = async ({ objectName, objectData, expire = null }) => {
  try {
    if (expire !== null && expire !== undefined) {
      await jsonCache.set(objectName, objectData, { expire });
    } else {
      await jsonCache.set(objectName, objectData);
    }
    return true;
  } catch (err) {
    console.log(err);
  }
};

// keys should be an array of strings of the keys that are required ['name', 'age', 'address.pin']
const getJson = async ({ objectName, keys = [] }) => {
  let objectData = await jsonCache.get(objectName, ...keys);

  if (objectData !== null || objectData !== undefined) {
    return objectData;
  } else {
    return null;
  }
};

const deleteJson = async (objectName) => {
  try {
    await jsonCache.del(objectName);
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { getJson, setJson, deleteJson };
