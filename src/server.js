const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var admin = require("firebase-admin");

// polku serviceaccountiin
const serviceAccount = require("/Users/sarasalim/Documents/Reseptisovellus/safkaa-e280f-firebase-adminsdk-v9l0g-edf6851691.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 5001;

app.use(bodyParser.json());
app.use(cors());

const db = admin.firestore();

app.get('/', (req, res) => {
    res.send('Tervetuloaa!');
});

// käyttäjien haku (admin-toiminnallisuus)
app.get('/api/kayttajat', async (req, res) => {
    try {
        const snapshot = await db.collection('kayttajat').get();
        const kayttajat = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            kayttajat.push(data);
        });
        res.json(kayttajat);
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).send('Internal Server Error');
    }
});

// käyttäjien poisto resepteineen (admin-toiminnallisuus)
app.delete('/api/kayttajahallinta/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const userDoc = await db.collection('kayttajat').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const uid = userDoc.data().uid;
        const recipesnapshot = await db.collection('reseptit').where('uid', '==', uid).get();
        const deleteRecipe = recipesnapshot.docs.map(async (doc) => {
            await doc.ref.delete();
        });
        await Promise.all(deleteRecipe);
        await admin.auth().deleteUser(uid);
        await db.collection('kayttajat').doc(id).delete();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// profiilitietojen haku
app.get('/api/kayttajaprofiili/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const snapshot = await db.collection('kayttajat').where("uid", "==", uid).get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'User not found with ID' });
        }
        const kayttajat = [];
        snapshot.forEach(doc => {
            kayttajat.push({ uid: doc.uid, ...doc.data() });
        });

        res.json(kayttajat);
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).send('Internal Server Error');
    }
});

// profiilitietojen muokkaus
app.put('/api/kayttajamuokkaus/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const { username, name } = req.body;
        const snapshot = await db.collection('kayttajat').where("uid", "==", uid).get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'User not found with ID' });
        }
        const update = snapshot.docs.map(async doc => {
            await doc.ref.set({ username, name }, { merge: true });
        });
        await Promise.all(update);

        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// uuden käyttäjän rekisteröinti 
app.post('/api/rekisterointi', async (req, res) => {
    try {
        const { email, name, uid, username } = req.body;
        const userCollectionRef = db.collection('kayttajat');
        await userCollectionRef.add({
            email: email,
            name: name,
            uid: uid,
            username: username,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Rekisteröityminen onnistui' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Rekisteröityminen epäonnistui' });
    }
});

// salasanan palautuslinkki
app.post("/api/salasananpalautus", async (req, res) => {
    try {
        const { email } = req.body;
        await admin.auth().getUserByEmail(email);
        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            res.status(404).json({ error: "User not found with this email" });
        } else {
            console.error("Error sending password reset email:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

// kaikkien reseptien haku
app.get('/api/reseptit', async (req, res) => {
    try {
        const snapshot = await db.collection('reseptit').get();
        const reseptit = [];
        snapshot.forEach(doc => {
            reseptit.push({ id: doc.id, ...doc.data() });
        });
        res.json(reseptit);
    } catch (error) {
        console.error('Error fetching:', error);
        res.status(500).send('Internal Server Error');
    }
});

// reseptin näkyvyyden rajoittaminen
app.put('/api/piilota/:recipeId', async (req, res) => {
    try {
        const recipeId = req.params.recipeId;

        await db.collection('reseptit').doc(recipeId).update({ hidden: true });

        res.status(200).json({ message: 'Resepti piilossa' });
    } catch (error) {
        console.error('Error hiding recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// reseptin näkyvyyden julkistaminen
app.put('/api/eipiilossa/:recipeId', async (req, res) => {
    try {
        const recipeId = req.params.recipeId;

        await db.collection('reseptit').doc(recipeId).update({ hidden: false });

        res.status(200).json({ message: 'Resepti ei ole piilossa' });
    } catch (error) {
        console.error('Error unhiding recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// omien reseptien näkymä
app.get('/api/userReseptit/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const snapshot = await db.collection('reseptit').where('uid', '==', uid).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Recipe not found with ID' });
        }
        const recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// oman reseptien muokkaus
app.put('/api/reseptinmuokkaus/:id', async (req, res) => {
    const { id } = req.params;
    const { name, ingredients, instructions, keywords } = req.body;

    try {
        const recipeRef = db.collection('reseptit').doc(id);
        const recipeDoc = await recipeRef.get();

        if (!recipeDoc.exists) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        await recipeRef.update({
            name,
            ingredients,
            instructions,
            keywords
        });

        res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// oman reseptin poisto
app.delete('/api/poistaResepti/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await db.collection('reseptit').doc(id).delete();
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Internal Server Error');
    }
});

// uuden reseptin lisäys
app.post('/api/uusiResepti', async (req, res) => {
    try {
        const { name, ingredients, instructions, keywords, images, uid } = req.body;
        const recipesCollectionRef = db.collection('reseptit');

        await recipesCollectionRef.add({
            name,
            ingredients,
            instructions,
            keywords,
            images,
            uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Reseptin lisäys onnistui' });
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.status(500).json({ error: 'Reseptin lisäys epäonnistui' });
    }
});

// reseptin lisääminen suosikkeihin
app.post('/api/suosikki', async (req, res) => {
    try {
        const { uid, rid } = req.body;

        await db.collection('suosikit').doc().set({
            uid: uid,
            rid: rid
        });

        res.status(201).json({ message: 'Resepti on lisätty suosikkeihin' });
    } catch (error) {
        console.error('Error adding favorite recipe:', error);
        res.status(500).json({ error: 'Reseptin lisäys suosikkeihin epäonnistui' });
    }
});

// suosikkilistan haku
app.get('/api/haesuosikit', async (req, res) => {
    try {
        const snapshot = await db.collection('suosikit').get();
        const favoriteRecipes = snapshot.docs.map(doc => {
            return {
                fid: doc.id,
                ...doc.data()
            };
        });

        res.json(favoriteRecipes);
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
        res.status(500).json({ error: 'Failed to fetch favorite recipes' });
    }
});

// suosikkireseptin poisto
app.delete('/api/poistasuosikki/:id', async (req, res) => {
    const fid = req.params.id;
    try {
        await db.collection('suosikit').doc(fid).delete();
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Internal Server Error');
    }
});

// uuden arvostelun kirjoittaminen
app.post('/api/uusiarvostelu', async (req, res) => {
    try {
        const { uid, rid, review, username} = req.body;
        if (!uid || !rid || !review) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await db.collection('arvostelut').add({
            uid,
            rid,
            review,
            username
        });
        res.status(201).json({ message: 'Arvostelu lisätty onnistuneesti' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// arvosteluiden hakeminen
app.get('/api/arvostelut', async (req, res) => {
    try {
        const { rid } = req.query;
        let query = db.collection('arvostelut');

        if (rid) {
            query = query.where('rid', '==', rid);
        }

        const snapshot = await query.get();
            
        const arvostelut = snapshot.docs.map(doc => {
            return {
                fid: doc.id,
                ...doc.data()
            };
        });

        res.json(arvostelut);
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
        res.status(500).json({ error: 'Failed to fetch favorite recipes' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});