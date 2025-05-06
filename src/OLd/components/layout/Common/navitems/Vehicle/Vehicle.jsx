import React, { useState } from 'react';

const Vehicle = () => {
  const [addCars, setAddCars] = useState([
    { Registeration_No: '', Driver_Mobile_no: '', Truck_Owner_Mobile_no: '', Status: '' }
  ]);

  const addVehicle = () => {
    setAddCars([...addCars, { Registeration_No: '', Driver_Mobile_no: '', Truck_Owner_Mobile_no: '', Status: '' }]);
  };

  const handleInputChange = (index, event) => {
    const values = [...addCars];
    values[index][event.target.name] = event.target.value;
    setAddCars(values);
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Vehicle_No</th>
              <th className="border px-4 py-2">Registeration_No</th>
              <th className="border px-4 py-2">Driver Mobile_No</th>
              <th className="border px-4 py-2">Truck Owner Mobile_No</th>
              <th className="border px-4 py-2">Status</th>            
            </tr>
          </thead>
          <tbody>
            {addCars.map((vehicle, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="Registeration_No"
                    value={vehicle.Registeration_No}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="Driver_Mobile_no"
                    value={vehicle.Driver_Mobile_no}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="Truck_Owner_Mobile_no"
                    value={vehicle.Truck_Owner_Mobile_no}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>   <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="Truck_Owner_Mobile_no"
                    value={vehicle.Truck_Owner_Mobile_no}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <select
                    name="Status"
                    value={vehicle.Status}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="✔">✔</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addVehicle}
        className="mt-4 text-blue-500 hover:text-blue-700"
      >
        + Add vehicle
      </button>
    </div>
  );
};

export default Vehicle;
