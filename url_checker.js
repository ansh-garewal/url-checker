const { MongoClient } = require('mongodb');
const { updateUrl } = require('./main');
const fs = require('fs');
const https = require('https');

const uri = 'mongodb+srv://flam-dev:scSf5PJmtwyZnnGh@dev0.4xtrj.mongodb.net/';

function checkUrlStatus(url) {
    return new Promise((resolve, reject) => {
        https
            .request(url, { method: 'HEAD' }, (response) => {
                const statusCode = response.statusCode;
                resolve(statusCode);
            })
            .on('error', (error) => {
                reject(error);
            })
            .end();
    });
}

function extractValuesFromUrl(url) {
    const parts = url.split('/');
    const env = parts[parts.length - 3];
    return env;
}

const client = new MongoClient(uri);

async function checkAndUpdateUrlStatus(url) {
    try {
        const statusCode = await checkUrlStatus(url);
        console.log(`URL ${url} status code: ${statusCode}`);

        if (statusCode >= 200 && statusCode < 300) {
            console.log('URL is active');
            return true;
        } else {
            console.log('URL is not active');
            return false;
        }
    } catch (error) {
        console.error('Error checking URL status:', error);
        return false;
    }
}

async function connect() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const database = client.db('zingcam');
        const collection = database.collection('flamcard');

        const documents = await collection.find({ status: 'PROCESSED' }).toArray();

        const log_data = [];

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            const updated_print_url = updateUrl(document.print_url);
            const updated_augment_url = updateUrl(document.augment_url);

            console.log('Updated print url -', updated_print_url);
            console.log('Updated augment url -', updated_augment_url);

            const env = extractValuesFromUrl(updated_print_url);
            console.log('Meta env -', env);
            const meta_url = `https://storage.googleapis.com/zingcam/flam/${env}/meta/${document._id}.txt`;

            console.log('Meta url -', meta_url);

            const updated_object = {
                id: document._id,
                print_url: updated_print_url,
                print_url_is_active: false,
                augment_url: updated_augment_url,
                augment_url_is_active: false,
                meta_url: meta_url,
                meta_url_is_active: false,
            };

            updated_object.print_url_is_active = await checkAndUpdateUrlStatus(updated_print_url);
            updated_object.augment_url_is_active = await checkAndUpdateUrlStatus(updated_augment_url);
            updated_object.meta_url_is_active =  await checkAndUpdateUrlStatus(meta_url);

            log_data.push(updated_object);
        }

        const logFilePath = 'log.json';
        const logContent = JSON.stringify(log_data, null, 2);

        fs.writeFile(logFilePath, logContent, (err) => {
            if (err) {
                console.error('Error writing log file:', err);
            } else {
                console.log(`Log file '${logFilePath}' created successfully.`);
            }
        });

        await client.close();
    } catch (error) {
        console.log(error);
    }
}

connect().then();
