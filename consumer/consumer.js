const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');

const rabbitmqHost = '192.168.1.10'; 
const rabbitmqPort = '5672';     // Port for RabbitMQ (default is 5672)

amqp.connect(`amqp://${rabbitmqHost}:${rabbitmqPort}`, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = 'file_updates';
        const consumerDir = path.join(__dirname, '/../consumer_directory');

        if (!fs.existsSync(consumerDir)) {
            fs.mkdirSync(consumerDir);
        }

        channel.checkQueue(queue, (err, ok) => {
            if (err) {
                console.log('Queue does not exist.');
                return;
            }
            console.log(`Messages in queue: ${ok.messageCount}`);
        });

        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const fileName = content.fileName;
                const fileContent = Buffer.from(content.fileContent, 'base64');
                const destPath = path.join(consumerDir, fileName);

                fs.writeFile(destPath, fileContent, (err) => {
                    if (err) throw err;
                    console.log(`[Consumer] File received and saved as: ${destPath}`);
                    // Acknowledge the message
                    channel.ack(msg);
                });
            }
        });
    });
});
