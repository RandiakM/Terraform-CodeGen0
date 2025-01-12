import React from 'react';
import TerraformOutput from '../src/components/TerraformOutput';

const GeneratedCodePage = ({ code }) => {
  return (
    <div>
      <h1>Generated Terraform Code</h1>
      <TerraformOutput code={code} />
    </div>
  );
};

export default GeneratedCodePage;

