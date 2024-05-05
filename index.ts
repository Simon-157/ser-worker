import "dotenv/config";
import server, { io } from "./app";
import { setupSocket } from "@core/controller/socketController";
import { logger } from "@config/logger";

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    setupSocket(io);
  logger.info(`Server started on port ${PORT}`);
});