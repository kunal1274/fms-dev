import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import jsonData from '../../JSON/data.json'; // Import your JSON file
import "./AddressForm.css";
const countries = ["United States", "Canada", "Mexico"]; // Add more countries as needed
const states = ["California", "Texas", "New York"]; // Add more states as needed

const AddressForm = () => {
  const [billingAddress, setBillingAddress] = useState({
    attention: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    fax: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    attention: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    fax: ''
  });

  useEffect(() => {
    // Assuming the JSON data has a single object for simplicity
    const data = jsonData[0]; 
    setBillingAddress({
      attention: '',
      country: data.address[0].billingAddress.country,
      address1: data.address[0].billingAddress.street1,
      address2: data.address[0].billingAddress.street2 || '',
      city: data.address[0].billingAddress.city,
      state: data.address[0].billingAddress.state,
      pinCode: data.address[0].billingAddress.pincode,
      phone: '',
      fax: ''
    });

    setShippingAddress({
      attention: '',
      country: data.address[0].shippingAddress.country,
      address1: data.address[0].shippingAddress.street1,
      address2: '',
      city: data.address[0].shippingAddress.city,
      state: data.address[0].shippingAddress.state,
      pinCode: data.address[0].shippingAddress.pincode,
      phone: '',
      fax: ''
    });
  }, []);

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'billing') {
      setBillingAddress({ ...billingAddress, [name]: value });
    } else {
      setShippingAddress({ ...shippingAddress, [name]: value });
    }
  };

  const copyBillingToShipping = () => {
    setShippingAddress(billingAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { billingAddress, shippingAddress };
    
    try {
      const response = await fetch('http://your-backend-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Form className="p-4" onSubmit={handleSubmit}>
  <Row>
    <Col md={6}>
      <h5>Billing Address</h5>
      <Form.Group controlId="billingAttention">
        <Form.Label className="text-left">Organization Name</Form.Label>
        <Form.Control
          type="text"
          name="attention"
          value={billingAddress.attention}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingCountry">
        <Form.Label className="text-left">Country / Region</Form.Label>
        <Form.Control
          as="select"
          name="country"
          value={billingAddress.country}
          onChange={(e) => handleInputChange(e, 'billing')}
        >
          <option>Select</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="billingAddress1">
        <Form.Label className="text-left">Street 1</Form.Label>
        <Form.Control
          type="text"
          name="address1"
          value={billingAddress.address1}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingAddress2">
        <Form.Label className="text-left">Street 2</Form.Label>
        <Form.Control
          type="text"
          name="address2"
          value={billingAddress.address2}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingCity">
        <Form.Label className="text-left">City</Form.Label>
        <Form.Control
          type="text"
          name="city"
          value={billingAddress.city}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingState">
        <Form.Label className="text-left">State</Form.Label>
        <Form.Control
          as="select"
          name="state"
          value={billingAddress.state}
          onChange={(e) => handleInputChange(e, 'billing')}
        >
          <option>Select or type to add</option>
          {states.map((state, index) => (
            <option key={index} value={state}>
              {state}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="billingPinCode">
        <Form.Label className="text-left">Pin Code</Form.Label>
        <Form.Control
          type="text"
          name="pinCode"
          value={billingAddress.pinCode}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingPhone">
        <Form.Label className="text-left">Phone</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          value={billingAddress.phone}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
      <Form.Group controlId="billingGSTIN">
            <Form.Label className="text-left">GSTIN No</Form.Label>
            <Form.Control
              type="text"
              name="GSTIN"
              value={billingAddress.GSTIN || ""}
              onChange={(e) => handleInputChange(e, 'billing')}
            />
          </Form.Group>

          <Form.Group controlId="billingPAN">
            <Form.Label className="text-left">PAN CARD No</Form.Label>
            <Form.Control
              type="text"
              name="PAN"
              value={billingAddress.PAN || ""}
              onChange={(e) => handleInputChange(e, 'billing')}
            />
          </Form.Group>
      <Form.Group controlId="billingFax">
        <Form.Label className="text-left">Fax Number</Form.Label>
        <Form.Control
          type="text"
          name="fax"
          value={billingAddress.fax}
          onChange={(e) => handleInputChange(e, 'billing')}
        />
      </Form.Group>
    </Col>
    <Col md={6}>
      <h5>
        Shipping Address (
        <span
          className="text-primary"
          style={{ cursor: 'pointer' }}
          onClick={copyBillingToShipping}
        >
          Copy billing address
        </span>
        )
      </h5>
      <Form.Group controlId="shippingAttention">
        <Form.Label className="text-left">Organization Name</Form.Label>
        <Form.Control
          type="text"
          name="attention"
          value={shippingAddress.attention}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingCountry">
        <Form.Label className="text-left">Country / Region</Form.Label>
        <Form.Control
          as="select"
          name="country"
          value={shippingAddress.country}
          onChange={(e) => handleInputChange(e, 'shipping')}
        >
          <option>Select</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="shippingAddress1">
        <Form.Label className="text-left">Street 1</Form.Label>
        <Form.Control
          type="text"
          name="address1"
          value={shippingAddress.address1}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingAddress2">
        <Form.Label className="text-left">Street 2</Form.Label>
        <Form.Control
          type="text"
          name="address2"
          value={shippingAddress.address2}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingCity">
        <Form.Label className="text-left">City</Form.Label>
        <Form.Control
          type="text"
          name="city"
          value={shippingAddress.city}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingState">
        <Form.Label className="text-left">State</Form.Label>
        <Form.Control
          as="select"
          name="state"
          value={shippingAddress.state}
          onChange={(e) => handleInputChange(e, 'shipping')}
        >
          <option>Select or type to add</option>
          {states.map((state, index) => (
            <option key={index} value={state}>
              {state}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="shippingPinCode">
        <Form.Label className="text-left">Pin Code</Form.Label>
        <Form.Control
          type="text"
          name="pinCode"
          value={shippingAddress.pinCode}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingPhone">
        <Form.Label className="text-left">Phone</Form.Label>
        <Form.Control
          type="text"
          name="phone"
          value={shippingAddress.phone}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingFax">
        <Form.Label className="text-left">Fax Number</Form.Label>
        <Form.Control
          type="text"
          name="fax"
          value={shippingAddress.fax}
          onChange={(e) => handleInputChange(e, 'shipping')}
        />
      </Form.Group>
      <Form.Group controlId="shippingGSTIN">
            <Form.Label className="text-left">GSTIN No</Form.Label>
            <Form.Control
              type="text"
              name="GSTIN"
              value={shippingAddress.GSTIN || ""}
              onChange={(e) => handleInputChange(e, 'shipping')}
            />
          </Form.Group>
      <Form.Group controlId="shippingPAN">
            <Form.Label className="text-left">PAN CARD No</Form.Label>
            <Form.Control
              type="text"
              name="PAN"
              value={shippingAddress.PAN || ""}
              onChange={(e) => handleInputChange(e, 'shipping')}
            />
          </Form.Group>
    </Col>
  </Row>

  <div className="mt-4">
    <p className="text-muted">
      <strong>Note:</strong>
      <br />
      You can add and manage additional addresses from Customers and Vendors details section.
      <br />
      View and edit the address format of your transactions under Settings &gt; Preferences &gt; Customers and Vendors.
    </p>
  </div>
</Form>
  );
};

export default AddressForm;
