import app from './app';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables in the entry point
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
