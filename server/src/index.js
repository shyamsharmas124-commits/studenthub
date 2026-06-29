require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { logStartupStatus, integrationStatus, missingRequired } = require("./config/env");


const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const progressRoutes = require('./routes/progressRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const quizRoutes = require('./routes/quizRoutes')

const app = express();
const DEFAULT_PORT = 5000;
const MAX_PORT_RETRIES = 10;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: missingRequired().length ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    integrations: integrationStatus(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/quiz", quizRoutes);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

function startServer(port, retriesLeft = MAX_PORT_RETRIES) {
	const server = app.listen(port, ()=> console.log(`Server is running on ${port}`));

	server.on("error", (err) => {
		const isPortConflict = err.code === "EADDRINUSE";
		const usingDefaultPort = !process.env.PORT;

		if (isPortConflict && usingDefaultPort && retriesLeft > 0) {
			const nextPort = port + 1;
			console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
			startServer(nextPort, retriesLeft - 1);
			return;
		}

		console.error("Failed to start server:", err.message);
		process.exit(1);
	});
}

const initialPort = Number(process.env.PORT) || DEFAULT_PORT;
logStartupStatus();
startServer(initialPort);
