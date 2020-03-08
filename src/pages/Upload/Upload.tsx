import React from 'react';
import './Upload.scss';
import Layout from '../../components/Navigation/Navigation';
import UploadForm from '../../components/UpoadForm/UploadForm';

function Upload(): React.ReactElement {
  return (
    <Layout visible home={false}>
      <UploadForm />
    </Layout>
  );
}

export default Upload;
