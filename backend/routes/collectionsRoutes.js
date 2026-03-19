const fs = require('fs');
const path = require('path');
const upload = require('../config/uploadConfig');

const collectionsRoutes = (app) => {
    const dbFile = path.resolve(__dirname, 'collections.json');

    const readCollections = () => {
        try {
            if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({}));
            return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        } catch (e) {
            console.error("Error reading collections.json", e);
            return {};
        }
    };

    // GET all collections (optional ?coreOnly=true to filter to system/open collections)
    app.get('/collections', (req, res) => {
        const map = readCollections();
        let list = Object.entries(map).map(([id, data]) => ({ id, ...data }));

        // coreOnly=true → only collections without an owner (open/system collections)
        if (req.query.coreOnly === 'true') {
            list = list.filter(col => !col.owner || col.owner === '');
        }

        res.status(200).json(list);
    });

    // GET single collection by ID
    app.get('/collections/:id', (req, res) => {
        const map = readCollections();
        const col = map[req.params.id];
        if (!col) return res.status(404).json({ error: "Collection not found" });
        res.status(200).json({ id: req.params.id, ...col });
    });

    // POST create a collection
    app.post(
        '/collections',
        upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }]),
        (req, res) => {
            const {
                id, name, description, bannerImage, logoImage, owner,
                category, websiteUrl, twitterUrl, discordUrl
            } = req.body;

            if (!id || !name) {
                return res.status(400).json({ error: "Missing required fields: id, name" });
            }

            const map = readCollections();
            if (map[id]) {
                return res.status(400).json({ error: "Collection ID already exists. Try a different name." });
            }

            const baseUrl = req.protocol + '://' + req.get('host');

            const resolvedBanner = req.files?.banner
                ? `${baseUrl}/images/${req.files.banner[0].filename}`
                : (bannerImage || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop");

            const resolvedLogo = req.files?.logo
                ? `${baseUrl}/images/${req.files.logo[0].filename}`
                : (logoImage || "https://images.unsplash.com/photo-1560414239-d28a14ad98cb?q=80&w=500&auto=format&fit=crop");

            // isCore is true only for collections with no owner (system-level)
            const isCore = !owner || owner.trim() === '';

            map[id] = {
                name,
                description: description || "",
                bannerImage: resolvedBanner,
                logoImage: resolvedLogo,
                owner: owner || "",
                isVerified: false,
                isCore,
                category: category || "",
                websiteUrl: websiteUrl || "",
                twitterUrl: twitterUrl || "",
                discordUrl: discordUrl || "",
                createdAt: new Date().toISOString(),
            };

            fs.writeFileSync(dbFile, JSON.stringify(map, null, 2));
            res.status(201).json({ message: `${baseUrl}/collections/${id}`, id, ...map[id] });
        }
    );

    // PUT update an existing collection (owner-only)
    app.put(
        '/collections/:id',
        upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'logo', maxCount: 1 }]),
        (req, res) => {
            const { id } = req.params;
            const map = readCollections();

            if (!map[id]) {
                return res.status(404).json({ error: "Collection not found" });
            }

            const {
                name, description, bannerImage, logoImage, owner,
                category, websiteUrl, twitterUrl, discordUrl
            } = req.body;

            const storedOwner = (map[id].owner || "").toLowerCase();
            const callerOwner = (owner || "").toLowerCase();

            if (!storedOwner) {
                return res.status(403).json({ error: "Collection has no owner recorded. Editing is disabled." });
            }
            if (!callerOwner || storedOwner !== callerOwner) {
                return res.status(403).json({ error: "Only the collection creator can edit this collection." });
            }

            const baseUrl = req.protocol + '://' + req.get('host');

            const resolvedBanner = req.files?.banner
                ? `${baseUrl}/images/${req.files.banner[0].filename}`
                : (bannerImage?.trim() || map[id].bannerImage);

            const resolvedLogo = req.files?.logo
                ? `${baseUrl}/images/${req.files.logo[0].filename}`
                : (logoImage?.trim() || map[id].logoImage);

            map[id] = {
                ...map[id],
                name: name?.trim() || map[id].name,
                description: description !== undefined ? description.trim() : map[id].description,
                bannerImage: resolvedBanner,
                logoImage: resolvedLogo,
                category: category !== undefined ? category.trim() : (map[id].category || ""),
                websiteUrl: websiteUrl !== undefined ? websiteUrl.trim() : (map[id].websiteUrl || ""),
                twitterUrl: twitterUrl !== undefined ? twitterUrl.trim() : (map[id].twitterUrl || ""),
                discordUrl: discordUrl !== undefined ? discordUrl.trim() : (map[id].discordUrl || ""),
                updatedAt: new Date().toISOString(),
            };

            fs.writeFileSync(dbFile, JSON.stringify(map, null, 2));
            res.status(200).json({ id, ...map[id] });
        }
    );

    // DELETE a collection (owner-only)
    app.delete('/collections/:id', (req, res) => {
        const { id } = req.params;
        const map = readCollections();

        if (!map[id]) {
            return res.status(404).json({ error: "Collection not found" });
        }

        const storedOwner = (map[id].owner || "").toLowerCase();
        const callerOwner = (req.body.owner || req.query.owner || "").toLowerCase();

        if (!storedOwner) {
            return res.status(403).json({ error: "Collection has no owner. Delete is disabled." });
        }
        if (!callerOwner || storedOwner !== callerOwner) {
            return res.status(403).json({ error: "Only the collection creator can delete this collection." });
        }

        delete map[id];
        fs.writeFileSync(dbFile, JSON.stringify(map, null, 2));
        res.status(200).json({ message: `Collection "${id}" deleted.` });
    });

    // PUT toggle verification (admin/mock)
    app.put('/collections/:id/verify', (req, res) => {
        const { id } = req.params;
        const map = readCollections();

        if (!map[id]) {
            return res.status(404).json({ error: "Collection not found" });
        }

        const { isVerified } = req.body;
        map[id] = {
            ...map[id],
            isVerified: isVerified !== undefined ? isVerified : !map[id].isVerified
        };

        fs.writeFileSync(dbFile, JSON.stringify(map, null, 2));
        res.status(200).json({ id, isVerified: map[id].isVerified });
    });
};

module.exports = collectionsRoutes;
