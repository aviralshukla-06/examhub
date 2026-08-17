import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";


import authRoutes from "./routes/auth.route";
import contentRoutes from "./routes/content.route";
import paymentRoutes from "./routes/payment.route";
import geoRoutes from "./routes/geo.route";
import topicRoutes from "./routes/topic.route";



const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/topics", topicRoutes);


app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
