import dotenv from "dotenv";
import app from "./app";
import { requestLogger } from "./middleware/requestLogger";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
    console.log(`📝 API Documentation: http://localhost:${PORT}/health`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    process.exit(0);
  });
}

// Export untuk Vercel serverless
export default app;