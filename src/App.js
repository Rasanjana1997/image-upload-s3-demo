import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import './App.css';

// Configure AWS with your credentials and region
AWS.config.update({
  accessKeyId: 'AKIAT4C7YLLCPYIF6BJQ',
  secretAccessKey: 'baiCFgb8UjrF/tmsTj6b4vr455dNLrJjPohOJt7l',
  region: 'us-east-1',
});

const S3_BUCKET = 'aws-test-bucket-rasa';
const s3 = new AWS.S3();

function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageList, setImageList] = useState([]);

  const fetchImagesFromS3 = async () => {
    const params = { Bucket: S3_BUCKET };
    try {
      const data = await s3.listObjectsV2(params).promise();
      const images = data.Contents.map(item => ({
        url: `https://${S3_BUCKET}.s3.${AWS.config.region}.amazonaws.com/${item.Key}`,
        name: item.Key,
      }));
      setImageList(images);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImagesFromS3();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToS3 = async () => {
    if (!image) {
      alert('Please select an image first!');
      return;
    }
    const params = {
      Bucket: S3_BUCKET,
      Key: image.name,
      Body: image,
      ContentType: image.type,
    };
    try {
      await s3.upload(params).promise();
      alert('Image uploaded successfully!');
      fetchImagesFromS3();
      setPreviewUrl('');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image.');
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>AWS S3 Bucket Image Upload App</h1>
        <p className="student-details">Created by: Rasanjana Dilshan | ID: 2024212802</p>
      </div>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewUrl && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}
        <button onClick={uploadImageToS3}>Upload Image</button>
      </div>
      <h3>Uploaded Images</h3>
      <div className="image-grid">
        {imageList.length === 0 ? (
          <p className="no-images-message">No images uploaded yet.</p>
        ) : (
          imageList.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image.url} alt={image.name} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
