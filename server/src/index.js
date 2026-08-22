require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { logStartupStatus, integrationStatus, missingRequired } = require("./config/env");
const sanitizeInputs = require("./middleware/sanitizeInputs");
const { initSocket } = require("./realtime/socket");
const { startScheduledJobs } = require("./jobs/scheduledJobs");


const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const courseRoutes = require('./routes/courseRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const progressRoutes = require('./routes/progressRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const quizRoutes = require('./routes/quizRoutes')
const rewardRoutes = require('./routes/rewardRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const shareRoutes = require('./routes/shareRoutes')

const app = express();
const DEFAULT_PORT = 5000;
const MAX_PORT_RETRIES = 10;

app.use(cors());
app.use(express.json());
app.use(sanitizeInputs);

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
app.use("/api/reward", rewardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/share", shareRoutes); // crawler-facing pre-rendered course pages, not under /api

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

function startServer(port, retriesLeft = MAX_PORT_RETRIES) {
	// Using http.createServer (instead of app.listen directly) so Socket.io can
	// share the same port as the REST API — no separate port, no client changes needed.
	const httpServer = http.createServer(app);
	initSocket(httpServer);

	const server = httpServer.listen(port, () => {
		console.log(`Server is running on ${port}`);
		startScheduledJobs();
	});

	server.on("error", (err) => {
		const isPortConflict = err.code === "EADDRINUSE";
		const usingManagedPort = !process.env.PORT || Number(process.env.PORT) === port;

		if (isPortConflict && usingManagedPort && retriesLeft > 0) {
			const nextPort = port + 1;
			console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
			startServer(nextPort, retriesLeft - 1);
			return;
		}

		console.error(`Failed to start server on port ${port}:`, err.message);
		process.exit(1);
	});
}

const initialPort = Number(process.env.PORT) || DEFAULT_PORT;
logStartupStatus();
startServer(initialPort);
