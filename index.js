import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

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
const user=db.collection('user')


app.get("/", (req, res) => {
  res.send("FixMate Server is running successfully");
});
app.get('/user',async(req,res)=>{
  const result=await user.find().toArray()
  res.send(result)
})
app.patch("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;

    const allowedRoles = ["admin", "customer", "technician"];

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid user ID" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).send({ message: "Invalid role" });
    }

    const query = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        role: role,
      },
    };

    const result = await user.updateOne(query, updateDoc);

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update role" });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await user.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    res.send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to delete user",
    });
  }
});app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await user.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    res.send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete user",
    });
  }
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
app.get("/service/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await servicesCollection.findOne(query);
  res.send(result);
});
app.delete("/serviceDelete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Received Service ID:", id);

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid service ID",
      });
    }

    const result = await servicesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    console.log("Delete Result:", result);

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "Service not found",
      });
    }

    res.send({
      success: true,
      message: "Service deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Error:", error);

    res.status(500).send({
      message: "Internal server error",
    });
  }
});
app.patch("/service/:id", async (req, res) => {
  const id = req.params.id;
  const updatedService = req.body;

  const query = { _id: new ObjectId(id) };

  const result = await servicesCollection.updateOne(
    query,
    {
      $set: {
        ...updatedService,
      },
    }
  );

  res.send(result);
});
app.get("/services", async (req, res) => {
  const result = await servicesCollection
    .find()
    .sort({ _id: -1 })
    .toArray();

  res.send(result);
});
app.post("/booking", async (req, res) => {
  const data = req.body;
  const result = await bookingsCollection.insertOne(data);
  res.send(result);
});
app.get("/booking/:email", async (req, res) => {
  const email = req.params.email;

  const query = {
    customerEmail: email,
  };

  const result = await bookingsCollection.find(query).toArray();

  res.send(result);
});
app.get("/booking", async (req, res) => {
  const result = await bookingsCollection.find().toArray();
  res.send(result);
});
app.get("/technician-bookings/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const query = {
      technicianEmail: email,
    };

    const result = await bookingsCollection
      .find(query)
      .sort({ _id: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get technician bookings",
    });
  }
});
app.patch("/booking-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).send({
        message: "Invalid status",
      });
    }

    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { status },
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to update status",
    });
  }
});
app.delete("/bookingDelete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: new ObjectId(id),
    };

    const result = await bookingsCollection.deleteOne(query);

    res.status(200).send({
      success: true,
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
