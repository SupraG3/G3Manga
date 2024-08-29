const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

app.use(cors({
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type, Authorization',
    methods: "GET, POST, OPTIONS, PUT, DELETE",
    origin: ["http://localhost:3000"]
}));

app.use(express.json());

mongoose.connect("mongodb://localhost:27042/ecommerce");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    firstName: { type: String },
    lastName: { type: String },
    birthDate: { type: Date },
    phoneNumber: { type: String },
    address: {
        street: { type: String },
        postalCode: { type: String },
        city: { type: String },
        country: { type: String }
    }
});

const articleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    discount: { type: Number, default: 0 }
  });

const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);

app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Email already in use." });
        } else {
            res.status(400).json({ message: "There was an error registering!" });
        }
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Login attempt for username:", username);
        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("Login successful, token generated");
        res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attacher les informations utilisateur à la requête
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

app.get("/api/user", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

app.put("/api/user", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData = req.body;
        console.log("Received data for update:", updatedData);

        if (updatedData.password) {
            updatedData.password = await bcrypt.hash(updatedData.password, 10);
        } else {
            delete updatedData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: 'Server error.' });
    }
});

app.delete("/api/user", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndDelete(userId);
        console.log("User deleted successfully.");
        res.json({ message: "User deleted successfully." });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error." });
    }
});

app.get("/api/users", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put("/api/users/:id", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (updatedData.password) {
            updatedData.password = await bcrypt.hash(updatedData.password, 10);
        } else {
            delete updatedData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete("/api/users/:id", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post("/api/articles", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { name, image, price, description, category, quantity } = req.body;
        const newArticle = new Article({ name, image, price, description, category, quantity });
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/articles", async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });  

  // Mise à jour d'un article
app.put("/api/articles/:id", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedArticle = await Article.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(updatedArticle);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Suppression d'un article
app.delete("/api/articles/:id", authenticateJWT, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedArticle = await Article.findByIdAndDelete(id);
        if (!deletedArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});
