import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000;

import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongo_client = await connectToMongoDB();
const db = mongo_client.db("FIXMATE");
const servicesCollection = db.collection("services");
const bookingsCollection = db.collection("bookings");

app.get("/", (req, res) => {
  res.send("FixMate Server is running successfully");
});
// http://localhost:8000/services
app.post("/services", async (req, res) => {
  const query = req.body;
  const result = await servicesCollection.insertOne(query);
  res.send(result);
});
app.get("/services/:email", async (req, res) => {
  const email = req.params.email;

  const query = { technicianEmail: email };

  const result = await servicesCollection.find(query).toArray();

  res.send(result);
});
app.get('/service/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const result=await servicesCollection.findOne(query)
  res.send(result)
})
app.get('/services',async(req,res)=>{
  const result=await servicesCollection.find().toArray()
  res.send(result)
})
app.post('/booking',async(req,res)=>{
  const data=req.body
  const result=await bookingsCollection.insertOne(data)
  res.send(result)
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
