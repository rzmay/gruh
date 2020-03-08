import React, { useState } from 'react';
import './UploadForm.scss';
import Recaptcha from 'react-recaptcha';
import { Form, FormGroup } from 'react-bootstrap';
import { siteKey } from '../../../private/RecaptchaConfig.json';
import uploadIcon from '../../assets/images/gruh_headphones_red.png';

function UploadForm(): React.ReactElement {
  const [file, setFile] = useState<{file: File | undefined, fileName: string | undefined}>({
    file: undefined,
    fileName: undefined,
  });

  const [formValid, setFormValid] = useState<{valid: boolean | undefined, message: string | undefined}>({
    valid: undefined,
    message: undefined,
  });

  function onSubmit(params) {
    console.log(params);
  }

  return (
    <div className="h-100 w-100 p-0 text-center upload-form-container">"
      <h1 className="display-3 mb-3"> Upload Audio </h1>
      <img src={uploadIcon} className="mb-5 upload-icon" alt="Upload Icon" />
      <p className="lead text-light"> Spread your message through Gruh's mouth. </p>

      <Form className="col-12 w-50 p-0 d-inline-block file-form needs-validation">
        <FormGroup>
          <input
            type="file"
            className={`custom-file-input file-form ${
              // eslint-disable-next-line no-nested-ternary
              (formValid.valid === undefined) ? undefined : (formValid.valid ? 'is-valid' : 'is-invalid')
            }`}
            id="batch-file"
            onChange={
              (e) => {
                if (e.target.files == null || e.target.files.length < 1) return;
                setFile({ file: e.target.files[0], fileName: e.target.files[0].name });
              }
            }
          />
          <label className="custom-file-label file-form" htmlFor="batch-file">{ file.fileName || 'Select file...' }</label>
          <div className="valid-feedback">
            Looks good!
          </div>
          <div className="invalid-feedback">
            {formValid.message}
          </div>
        </FormGroup>
        <div>
          <Recaptcha
            sitekey={siteKey}
            className="m-2 d-inline-block"
          />
        </div>
        <input type="submit" className="form-control w-25 d-inline-block" />
      </Form>
    </div>
  );
}

export default UploadForm;
