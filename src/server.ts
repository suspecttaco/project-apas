import 'dotenv/config';
import app from './app';
import { db } from './lib/db';
import { cargarPermisos } from './lib/permissions';

const PORT = process.env.PORT ?? 3000;

async function main() {
    try {
        await db.$connect();
        console.log('DB Connected');

        await cargarPermisos();

        app.listen(PORT, () => {
            console.log(`Server running on localhost:${PORT}`);
            console.log(`Swagger available on localhost:${PORT}/api/docs`);
        });
    } catch (error) {
        console.log('DB connection error: ', error);
        process.exit(1);
    }
}

main();