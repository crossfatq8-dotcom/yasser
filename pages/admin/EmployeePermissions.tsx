
import React from 'react';
import { useData } from '../../data/DataContext';
import { Employee, PERMISSIONS, PermissionKey } from '../../types';

const EmployeePermissions: React.FC = () => {
  const { employees, updateEmployee } = useData();

  const handlePermissionChange = (employee: Employee, permissionKey: PermissionKey) => {
    const updatedPermissions = {
      ...employee.permissions,
      [permissionKey]: !employee.permissions[permissionKey],
    };
    updateEmployee({ ...employee, permissions: updatedPermissions });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">صلاحيات الموظفين</h1>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">الموظف</th>
                {Object.values(PERMISSIONS).map(permissionName => (
                    <th key={permissionName} scope="col" className="px-4 py-3 text-center">{permissionName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <img src={employee.photoUrl} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <span>{employee.name}</span>
                            <span className="block text-xs text-gray-400">{employee.jobTitle}</span>
                        </div>
                    </div>
                  </td>
                  {(Object.keys(PERMISSIONS) as PermissionKey[]).map(key => (
                      <td key={key} className="px-4 py-4 text-center">
                        <input
                            type="checkbox"
                            checked={employee.permissions[key]}
                            onChange={() => handlePermissionChange(employee, key)}
                            className="h-5 w-5 text-orange-600 bg-gray-700 border-gray-500 rounded focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePermissions;
