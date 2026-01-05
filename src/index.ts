// // src/index.ts
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 8000;
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

    
// const dbName = process.env.DB_NAME || 'boolean_force';
// const mongoUri = process.env.MONGODB_URI;

// // MongoDB client
// const client = new MongoClient(mongoUri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     },
// });

// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

// async function run(){
//     try {
//         await client.connect();
//         console.log('Connected to MongoDB');
//         const db = client.db(dbName)
//         const dbCollections={
//             userCollection: db.collection('users'),
//         }

//         // Perform actions using the dbCollections as needed
//         app.get('/users', async(req, res)=>{
//             const users = await dbCollections.userCollection.find().toArray();
//             res.send(users);
//         })
//     }
//     catch (err) {
//         console.error('Failed to connect to MongoDB', err);
//     }
// }

// run().catch(console.dir);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });






// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbName = process.env.DB_NAME || 'boolean_force';
const mongoUri = process.env.MONGODB_URI;

// Check if MONGODB_URI is defined
if (!mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
    process.exit(1);
}

// MongoDB client
const client = new MongoClient(mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Database and collection variables (will be initialized in connectToDatabase)
let db: any;
let userCollection: any;
let chatsCollection: any;

// Function to connect to the database
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        db = client.db(dbName);
        userCollection = db.collection('users');
        chatsCollection = db.collection('chats');
        console.log(`Database: "${dbName}" and collection: "users" are ready.`);
    } catch (err) {
        console.error('FATAL ERROR: Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process if we can't connect to the DB
    }
}

// Simple error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});


// Root route
app.get('/', (req, res) => {
    res.send('Hello, World! Server is running.');
});

// Get all users
app.get('/chat-users', async (req, res) => {
    try {
        const users = await userCollection.find({}).toArray();
        res.status(200).json({ success: true, data: users, count: users.length });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Get a single user by ID
app.get('/chat-users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Validate if the ID is a valid ObjectId format
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

// --- START SERVER ---

async function startServer() {
    // 1. Connect to the database FIRST
    await connectToDatabase();
    
    // 2. THEN start the server
    app.listen(PORT, () => {
        console.log(`   Server is running on http://localhost:${PORT}`);
    });
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nSIGINT received: Closing MongoDB connection...');
    try {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during MongoDB disconnection:', error);
        process.exit(1);
    }
});

// Start the application
startServer().catch(console.error);