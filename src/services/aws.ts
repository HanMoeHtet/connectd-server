import AWS from 'aws-sdk';

AWS.config.getCredentials((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

export default AWS;
