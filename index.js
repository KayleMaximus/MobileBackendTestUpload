const { db, storage } = require("./firebase.js");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const multer = require("multer");
const { FieldValue } = require("firebase-admin/firestore");

const app = express();
app.use(express.json());
const port = process.env.PORT || 8383;

const multerStorage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "/uploads");
  // },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ multerStorage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // else{
    //   return res.status(201).json(req.file)
    // }

    const { username, password } = req.body;

    // Define the destination file path in Firebase Storage
    const fileName = uuidv4(); // Generate a unique filename using UUID
    const destinationFileName = "images/" + fileName; // Use the generated filename

    // Upload the file to Firebase Storage
    await storage.bucket().file(destinationFileName).save(req.file.buffer, {
      contentType: req.file.mimetype,
    });

    const fileURL = await storage.bucket().file(destinationFileName).getSignedUrl({
      action:"read",
      expires: "01-01-3000"
    })

    console.log(fileURL.toString()); 
    // console.log('Url ', fileURL);

    // await storage.bucket().file(destinationFileName).save(fileBuffer, {
    //   contentType: req.file.mimetype,
    // });

    res.status(201).json({username: username, password: password, url:fileURL.toString()});
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading image!");
  }
});

app.get('/friend', async(req,res)=>{
  const peopleCollectionSnapshot = await db.collection("people").get();
  const list = peopleCollectionSnapshot.docs.map((document)=>({
    id: document.id,
    ...document.data()
  }));
  res.send(list);
})

app.post("/addFriend", async (req, res) => {
  const { name, status } = req.body;
  const peopleRef = db.collection("people");
  await peopleRef.add({ name, status });
  res.status(200).send("Posted");
});

app.patch("/updateFriend", async (req, res) => {
  const id = req.body.id
  delete req.body.id
  const data = req.body
  await db.collection('people').doc(id).update(req.body)

  res.status(200).send("Updated");
});

app.delete('/deleteFriend/:id', async (req, res) => {
  const id = req.params.id;
  //const id = req.body.id
  await db.collection('people').doc(id).delete()
  res.status(200).send("Deleted");
});

app.listen(port, () => console.log(`Server has started on ${port}`));
