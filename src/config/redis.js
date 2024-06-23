const redis = require("redis");
const client = redis.createClient({
    password: 'zRNhI9wsePgr5oA3QlLwJFZs90zWlHjJ',
    socket: {
        host: 'redis-17778.c302.asia-northeast1-1.gce.redns.redis-cloud.com',
        port: 17778
    }
});

client.on('error', (err) => console.error('Redis Client Error', err));

client.connect().catch(console.error);

module.exports = client;
