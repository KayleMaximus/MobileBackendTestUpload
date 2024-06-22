const express = require('express');
const router = express.Router();

const playlistController = require('../app/controllers/PlaylistController');
const convertSongIDtoSongName = require('../app/middlewares/playlist');
const auth = require('../app/middlewares/auth')


router.patch('/addSongToPlaylist', convertSongIDtoSongName, playlistController.addSongToPlaylist);
router.patch('/deleteSongFromPlaylist', convertSongIDtoSongName, playlistController.deleteSongFromPlaylist);
router.get('/getPlaylistByUserID/:userID',  playlistController.getPlaylistByUserID);
router.get('/getSpecificPlaylist',  playlistController.getSpecificPlaylist);
router.get('/',  playlistController.index);
router.post('/', playlistController.create);
router.patch('/', playlistController.updateName);
router.delete('/', playlistController.delete);

module.exports = router;