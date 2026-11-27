import { brand } from './brand.js';
import { createHttpApplication } from './app.js';

const app = createHttpApplication();
const server = app.listen(Number(process.env.PORT ?? 8080));
server.once('listening', () => console.log(`${brand.name} API ready`));
