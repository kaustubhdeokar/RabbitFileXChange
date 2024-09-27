const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');

const rabbitmqHost = '100.78.115.75';

function queueFile(filePath) {
    
    amqp.connect(`amqp://${rabbitmqHost}`, (error0, connection) => {
        if (error0) throw error0;

        connection.createChannel((error1, channel) => {
            if (error1) throw error1;

            const queue = 'file_updates';
            fs.readFile(filePath, (err, data) => {
                if (err) throw err;

                const message = {
                    fileName: path.basename(filePath),
                    fileContent: data.toString('base64')
                };
                channel.assertQueue(queue, { durable: true });
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
                console.log(`[Producer] Sent file: ${filePath}`);
                setTimeout(() => {
                    connection.close();
                    process.exit(0);
                }, 500);
            });
        });
    });
}

async function chooseDirectory() {

    const path = require('path');
    const prompt = require('prompt-sync')({ sigint: true });

    const defaultDirectory = '../directory';
    const fullPath = path.resolve(defaultDirectory);
    const directory = prompt('Select a directory to copy files to the client. The default directory is ../directory.') || fullPath;
    console.log(`Copying files from ${directory}`);

    return directory;
}

(async function main() {

    try {
        const dirPath = await chooseDirectory();

        const files = fs.readdirSync(dirPath);


        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (fs.lstatSync(filePath).isFile()) {
                queueFile(filePath);
            }
        });

    }
    catch (err) {
        console.error('Error:', err);
    }
})
    ();


