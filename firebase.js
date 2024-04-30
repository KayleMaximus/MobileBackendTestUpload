const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./creds.json'); // Replace with your actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://nodejsapp-89f00.appspot.com"
});

// Get Firestore and Storage references
const db = getFirestore();
const storage = getStorage();
module.exports = { db, storage };