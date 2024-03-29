require('dotenv').config();

const AWS = require('aws-sdk');
const uuid = require('uuid');
const express = require('express') //express를 설치했기 때문에 가져올 수 있다.
const app = express()

const {
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    AWS_S3_BUCKET,
    AWS_REGION,
  } = process.env;

  console.log(AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    AWS_S3_BUCKET,
    AWS_REGION)

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION,
});
  
async function putPresignedUploadUrl(directory) {
    const key = `${directory}/${uuid.v4()}`;
    const url = await s3.getSignedUrl('putObject', {
        Bucket: AWS_S3_BUCKET,
        Key: key,
        ContentType: 'image/*',
        Expires: 300,
      });
    return url;
}

async function getPresignedUploadUrl(directory, id) {
    const key = `${directory}/${id}`;
    const url = await s3.getSignedUrl('getObject', {
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Expires: 300,
      });
    return url;
}

app.get('/', async (req, res) => {
    const presignedURL = await putPresignedUploadUrl('profile');
    res.json({data: presignedURL})
});

app.get('/profile', async (req, res) => {
    if (req.query?.id == null || req.query?.id.length === 0) {
        throw new Error('id is required');
    }

    const presignedURL = await getPresignedUploadUrl('profile', req.query.id);
    res.json({data: presignedURL})
});

app.listen(5555);
console.log("http://localhost:5555");
