const redisClient = require("../../config/redis");

class Cache {
  async cacheAllSong(req, res, next) {
    const cacheKey = "all-songs";

    try {
      const data = await redisClient.get(cacheKey);

      if (data) {
        console.log("Cache hit");
        res.send(JSON.parse(data));
      } else {
        console.log("Cache miss");
        next();
      }
    } catch (error) {
      console.error("Redis error:", error);
      next(error);
    }
  }
}

module.exports = new Cache();
