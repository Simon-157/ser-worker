import app from './app';
import { logger } from './config/logger';
import "dotenv/config";

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});