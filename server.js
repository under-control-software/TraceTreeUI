//@ts-check

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
    app.use(express.static("./client/src/App.js"));
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/customers", cors(), (req, res) => {
    const customers = [
        { id: 1, firstName: "John", lastName: "Doe" },
        { id: 2, firstName: "Brad", lastName: "Traversy Abc" },
        { id: 3, firstName: "Mary", lastName: "Swanson" },
    ];

    res.json(customers);
});

const port = process.env.PORT || 5000;

app.listen(port, () => `Server running on port ${port}`);
