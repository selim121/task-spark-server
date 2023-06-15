const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d18ofon.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        client.connect();

        const tasksCollection = client.db("taskSpark").collection("taskManagement");

        app.post('/taskCollection', async (req, res) => {
            try {
                const task = req.body;
                const result = await tasksCollection.insertOne(task);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An error occurred while posting user' });
            }
        })

        app.get('/tasks/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const query = { email: email };
                const result = await tasksCollection.find(query).sort({ addedTime: -1 }).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An error occurred while fetching tasks' });
            }
        });

        app.patch('/task/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'Completed'
                }
            }
            const result = await tasksCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateTask = req.body;
            const updateDoc = {
                $set: {
                    title: updateTask.title,
                    description: updateTask.description,
                }
            };
            const result = await tasksCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Spark is running...')
})

app.listen(port, () => {
    console.log(`Task Spark is running on port ${port}`);
})