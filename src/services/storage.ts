import AWS from './aws';

const BUCKET_NAME = 'connectd-storage';

const s3 = new AWS.S3();

export const upload = async (key: string, body: any) => {
  const params = {
    Bucket: BUCKET_NAME,
    ACL: 'public-read',
    Key: key,
    Body: body,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
