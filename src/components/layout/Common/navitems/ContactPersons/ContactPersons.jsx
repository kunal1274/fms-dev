// ContactPersons.jsx
import React, { useState } from 'react';

const ContactPersons = () => {
  const [contactPersons, setContactPersons] = useState([
    { salutation: '', firstName: '', lastName: '', email: '', workPhone: '', mobile: '' }
  ]);

  const addContactPerson = () => {
    setContactPersons([...contactPersons, { salutation: '', firstName: '', lastName: '', email: '', workPhone: '', mobile: '' }]);
  };

  const handleInputChange = (index, event) => {
    const values = [...contactPersons];
    values[index][event.target.name] = event.target.value;
    setContactPersons(values);
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Salutation</th>
              <th className="border px-4 py-2">First Name</th>
              <th className="border px-4 py-2">Last Name</th>
              <th className="border px-4 py-2">Email Address</th>
              <th className="border px-4 py-2">Work Phone</th>
              <th className="border px-4 py-2">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {contactPersons.map((person, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="salutation"
                    value={person.salutation}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="firstName"
                    value={person.firstName}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="lastName"
                    value={person.lastName}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="email"
                    name="email"
                    value={person.email}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="workPhone"
                    value={person.workPhone}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    name="mobile"
                    value={person.mobile}
                    onChange={event => handleInputChange(index, event)}
                    className="w-full p-2 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={addContactPerson}
        className="mt-4 text-blue-500 hover:text-blue-700"
      >
        + Add Contact Person
      </button>
    </div>
  );
};

export default ContactPersons;
ContactPersons.jsx

