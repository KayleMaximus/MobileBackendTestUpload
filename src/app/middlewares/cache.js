const redisClient = require("../../config/redis");

class Cache {
  async cacheAllUsers(req, res, next) {
    const cacheKey = "all-users";

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

  async cacheAllSongs(req, res, next) {
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

  async cacheAllArtists(req, res, next) {
    const cacheKey = "all-artists";

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

  async cacheAllAlbums(req, res, next) {
    const cacheKey = "all-albums";

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

  async cacheAllGenres(req, res, next) {
    const cacheKey = "all-genres";

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

  async cacheAllBanners(req, res, next) {
    const cacheKey = "all-banners";

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
