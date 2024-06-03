const { Database } = require('@sqlitecloud/drivers');

let sqlite = new Database('sqlitecloud://admin:PXkaMNef9D@cp7nwljsiz.sqlite.cloud:8860/detect-songs');

module.exports = sqlite;
