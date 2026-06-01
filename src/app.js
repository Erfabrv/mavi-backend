const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

const authRoutes       = require("./routes/auth");
const userRoutes       = require("./routes/user");
const businessRoutes   = require("./routes/business");
const investmentRoutes = require("./routes/investment");

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin:"*" }));
app.use(express.json());
app.use(rateLimit({ windowMs:15*60*1000, max:100 }));

app.use("/api/auth",       authRoutes);
app.use("/api/user",       userRoutes);
app.use("/api/business",   businessRoutes);
app.use("/api/investment", investmentRoutes);

app.get("/health", (_, res) => res.json({ status:"ok" }));

module.exports = app;