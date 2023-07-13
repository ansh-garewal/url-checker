const { MongoClient } = require('mongodb');
const { updateUrl } = require('./main');
const fs = require('fs');
const https = require('https');

const uri = 'mongodb+srv://flam-dev:scSf5PJmtwyZnnGh@dev0.4xtrj.mongodb.net/';


function checkUrlStatus(url) {
    return new Promise((resolve, reject) => {
        https.request(url, { method: 'HEAD' }, (response) => {
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

async function connect() {

    try {
        await client.connect();
        console.log('Connected to DB');

        const database = client.db('zingcam');
        const collection = database.collection('flamcard');


        const object_list = [];
        const log_data = [];


        await collection.find({ "status": "PROCESSED" }).toArray().then((documents) => {
            documents.forEach((document) => {

                const object_data = new Object();
                object_data.id = document._id;
                object_data.print_url = document.print_url;
                object_data.print_url_is_active = false;
                object_data.augment_url = document.augment_url;
                object_data.augment_url_is_active = false;

                object_list.push(object_data);
            });
        }).catch((error) => {
            console.error('Error retrieving documents:', error);
        });


        for (var i = 0; i < object_list.length; i++) {


            const updated_print_url = updateUrl(object_list[i].print_url);
            const updated_augment_url = updateUrl(object_list[i].augment_url);

            console.log("Updated print url -", updated_print_url);
            console.log("Updated augment url -", updated_augment_url);


            const env = extractValuesFromUrl(updated_print_url);
            console.log("Meta env -" , env);
            const meta_url = 'https://storage.googleapis.com/zingcam/flam/${env}/meta/${flamcardId}.txt'
                .replace('${env}', env)
                .replace('${flamcardId}', object_list[i].id);
            
            console.log("Meta url -", meta_url);

            const updated_object = new Object();
            updated_object.id = object_list[i].id;
            updated_object.print_url = updated_print_url;
            updated_object.print_url_is_active = false;
            updated_object.augment_url = updated_augment_url;
            updated_object.augment_url_is_active = false;
            updated_object.meta_url = meta_url;
            updated_object.meta_url_is_active = false;

        
            try {
                const statusCode = await checkUrlStatus(updated_print_url);
                console.log(`URL ${updated_print_url} status code: ${statusCode}`);

                if (statusCode >= 200 && statusCode < 300) {
                    updated_object.print_url_is_active = true;
                    console.log('URL is OK');
                } else {
                    console.log(`${updated_print_url} - URL is not OK`);
                }
            } catch (error) {
                console.error('Error checking URL status:', error);
            }

            try {
                const statusCode = await checkUrlStatus(updated_augment_url);
                console.log(`URL ${updated_augment_url} status code: ${statusCode}`);

                if (statusCode >= 200 && statusCode < 300) {
                    updated_object.augment_url_is_active = true;
                    console.log('URL is OK');
                } else {
                    console.log(`${updated_augment_url} - URL is not OK`);
                }
            } catch (error) {
                console.error('Error checking URL status:', error);
            }

            try {
                const statusCode = await checkUrlStatus(meta_url);
                console.log(`URL ${meta_url} status code: ${statusCode}`);

                if (statusCode >= 200 && statusCode < 300) {
                    updated_object.meta_url_is_active = true;
                    console.log('URL is OK');
                } else {
                    console.log(`${meta_url} - URL is not OK`);
                }
            } catch (error) {
                console.error('Error checking URL status:', error);
            }


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


    } catch (error) {
        console.log(error);
    }
}


connect().then();




