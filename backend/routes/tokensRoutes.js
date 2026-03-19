const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const { v4: uuidv4 } = require('uuid');
const upload = require('../config/uploadConfig');

const tokensRoutes = (app) => {
  // VARIABLES
  const dbFile = path.resolve(__dirname, 'db.json');
  const db = fs.readFileSync(dbFile, 'utf8');
  // const db = require('./db.json');
  const tokens = JSON.parse(db);

  // INDEX
  app.get('/tokens/:tokenID', (req, res) => {
    const { tokenID } = req.params;

    res.status(200).json(tokens[tokenID]);
  });

  // CREATE
  app.post('/tokens', upload.single('img'), async (req, res) => {
    const { filename, path: filePath } = req.file;
    const { tokenId, name, description, collectionId } = req.body;
    const mimeType = req.file.mimetype || '';

    let imageUri = req.protocol + '://' + req.get('host') + "/images/" + filename;
    let metadataUri = req.protocol + '://' + req.get('host') + req.originalUrl + '/' + tokenId;

    if (process.env.PINATA_JWT || (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET)) {
      try {
        const pinataHeaders = process.env.PINATA_JWT
          ? { Authorization: `Bearer ${process.env.PINATA_JWT}` }
          : {
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_API_SECRET,
          };

        // 1. Upload Image to IPFS
        const data = new FormData();
        data.append('file', fs.createReadStream(filePath));

        const imgRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            ...pinataHeaders
          }
        });

        imageUri = `ipfs://${imgRes.data.IpfsHash}`;

        // 2. Upload Metadata to IPFS
        const metadata = {
          name,
          description,
          image: imageUri,
          mimeType,
          attributes: collectionId ? [{ trait_type: "Collection", value: collectionId }] : []
        };

        const metaRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
          headers: pinataHeaders
        });

        metadataUri = `ipfs://${metaRes.data.IpfsHash}`;
      } catch (error) {
        console.error("Pinata upload failed, falling back to local:", error.message);
        if (error.response) console.error(error.response.data);
      }
    }

    tokens[tokenId] = {
      name,
      description,
      collectionId: collectionId || null,
      image: imageUri,
      mimeType
    };

    fs.writeFileSync(dbFile, JSON.stringify(tokens, null, 2));

    res.status(201).json({ message: metadataUri });
  });
};

module.exports = tokensRoutes;

