import React from 'react'
import { Button } from 'react-bootstrap';

const Footer = ({ handleSave }) => {
  return (
    <div className="mt-4">
    <Button variant="primary" className="mr-2"onClick={handleSave}>
      Save
    </Button>
    <Button variant="secondary">Cancel</Button>
  </div>
  )
}

export default Footer
