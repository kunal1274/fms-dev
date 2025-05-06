import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, InputGroup, FormControl } from 'react-bootstrap';

const OtherDetails = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-transparent rounded-0 shadow-none">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Opening Balance</Form.Label>
          <InputGroup>
            <InputGroup.Text>INR</InputGroup.Text>
            <FormControl type="number" placeholder="Enter Opening Balance" />
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Terms</Form.Label>
          <Form.Control as="select">
            <option>Due on Receipt</option>
            <option>Net 15</option>
            {/* Add other payment terms options as needed */}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Documents</Form.Label>
          <Form.Control type="file" multiple />
          <Form.Text>You can upload a maximum of 10 files, 10MB each</Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Business Unit Location</Form.Label>
          <Form.Control as="select">
            <option>Delhi</option>
            <option>Kolkata</option>
            {/* Add other locations as needed */}
          </Form.Control>
        </Form.Group>
      </Form>
    </div>
  );
};

export default OtherDetails;
