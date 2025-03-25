import React, { useState } from "react";
import RadioButton from "../RadioButton/RadioButton";
import Label from "../Label/Label";
import TextInput from "../Input/Input";
import { Form, Button, Row, Col } from "react-bootstrap";
import Select from "../Option/Option";
import { ListItem } from "flowbite-react";
// import "./VehicleForm.css";

const VehicleForm = () => {
  const [type, setType] = useState("Truck");

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Vehicle Form submitted");
  };

  return (
    <div className="screen container mx-auto p-4 mt-20 screen ">
      <form onSubmit={handleSubmit}>
      {/* <h1 className="text-center bold mb-4  font-medium ">Vehicle Details</h1>

      // 
    <div className="flex items-left ml-36 gap-3 ">
  
    <Label label="Vehicle type" className="w-1/6  ml-8  " />

<select   
  name="type"
  value={type}
  onChange={handleTypeChange}
  className=" vehicle ml-56 mr-44 items-left w-full" 
>
  <option value="">Select a vehicle type</option>
  <option value="Truck">Truck</option>
  <option value="Tata Magic">Tata Magic</option>
  <option value="Pickup">Pickup</option>
  <option value="Small Vehicle">Small Vehicle</option>
  <option value="Heavy Vehicle">Heavy Vehicle</option>
</select>
           */}
        <br />  
{/* </div> */}
<h2 className="text-center bold mb-4 font-medium ml-44">Vechile Details</h2>

<div className="mb-4 flex ml-44 items-center">
          <Label label="Vehicle type" className="w-1/4  " />
          <select
            name="Vehicle Type"
            placeholder=" Vehicle Type  "
            onChange={handleTypeChange}
            className="w-3/4"
            required
          >  <option value="">Select a vehicle type</option>
          <option value="Truck">Truck</option>
          <option value="Tata Magic">Tata Magic</option>
          <option value="Pickup">Pickup</option>
          <option value="Small Vehicle">Small Vehicle</option>
          <option value="Heavy Vehicle">Heavy Vehicle</option>
          </select>
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Vehicle Name" className="w-1/4  " />
          <TextInput
            name="VehicleName"
            placeholder=" Vehicle Name"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Vehicle Model" className="w-1/4 " />
          <TextInput
            name="VehicleModel"
            placeholder=" Vehicle Model"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Brand" className="w-1/4 " />
          <TextInput
            name="Brand"
            placeholder=" Brand"
            className="w-3/4"
            required
          />
        </div>

        <h2 className="text-center bold mb-4 font-medium ml-44">Owner Details</h2>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Owner Name" className="w-1/4 " />
          <TextInput
            name="OwnerName"
            placeholder=" Owner Name"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Owner Address" className="w-1/4 " />
          <TextInput
            name="OwnerAddress"
            placeholder=" Owner Address"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Owner Contact" className="w-1/4 " />
          <TextInput
            name="OwnerContact"
            placeholder=" Owner Contact"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Owner Adhar id No " className="w-1/4 " />
          <TextInput
            name="OwnerContact"
            placeholder=" Owner Adhar id No"
            className="w-3/4"
            required
          />
        </div>

        <h2 className="text-center bold mb-4 font-medium ml-44">Driver Details</h2>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Driver Name" className="w-1/4 " />
          <TextInput
            name="DriverName"
            placeholder=" Driver Name"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="License No" className="w-1/4 " />
          <TextInput
            name="LicenseNo"
            placeholder=" License No"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Driver Address" className="w-1/4 " />
          <TextInput
            name="DriverAddress"
            placeholder=" Driver Address"
            className="w-3/4"
            required
          />
        </div>

        <div className="mb-4 flex ml-44 items-center">
          <Label label="Driver Contact" className="w-1/4 " />
          <TextInput
            name="DriverContact"
            placeholder=" Driver Contact"
            className="w-3/4"
            required
          />
        </div>

        
      </form>
    </div>
  );
};

export default VehicleForm;



