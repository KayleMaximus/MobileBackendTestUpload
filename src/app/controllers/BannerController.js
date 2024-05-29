const { db, storage } = require("../../config/db/firebase");
const { v4: uuidv4 } = require("uuid");
const Banner = require("../models/Banner");
const generateRandomID = require("../utils/randomID");

class BannerController {
  async index(req, res, next) {
    const list = [];
    await db
      .collection("banners")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const bannerData = doc.data();
          const banner = new Banner(
            bannerData.bannerID,
            bannerData.imageURL,
            bannerData.link
          );
          list.push(banner);
        });
      })
      .catch(next);
    res.send(list);
  }
  async create(req, res) {
    const bannerID = generateRandomID(33);
    const { link } = req.body;
    const file = req.file;

    try {
      console.log(bannerID, file, link);

      const fileName = uuidv4(); // Generate a unique filename using UUID
      const destinationFileName = "images/" + fileName; // Use the generated filename

      await storage.bucket().file(destinationFileName).save(file.buffer, {
        contentType: file.mimetype,
      });

      const fileURL = await storage
        .bucket()
        .file(destinationFileName)
        .getSignedUrl({
          action: "read",
          expires: "01-01-3000",
        });

      const newBanner = new Banner(bannerID, fileURL.toString(), link);

      console.log(newBanner);
      await db.collection("banners").add({
        bannerID: newBanner.bannerID,
        imageURL: newBanner.imageURL,
        link: newBanner.link,
      });
      res.status(201).send("Banner created successfully");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = new BannerController();
