import React, { useState, useEffect } from 'react';
import { useData } from '../../data/DataContext';
import { Employee, PayrollRecord } from '../../types';

const PayrollManagement: React.FC = () => {
  const { employees, payrollRecords, addOrUpdatePayrollRecord } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handleMonthChange = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handlePayrollChange = (employeeId: string, field: keyof Omit<PayrollRecord, 'employeeId' | 'year' | 'month'>, value: number) => {
    const existingRecord = payrollRecords.find(r => r.employeeId === employeeId && r.year === year && r.month === month);
    const newRecord: PayrollRecord = {
      employeeId,
      year,
      month,
      attendanceDays: existingRecord?.attendanceDays || 30,
      deductions: existingRecord?.deductions || 0,
      bonuses: existingRecord?.bonuses || 0,
      advance: existingRecord?.advance || 0,
      [field]: value,
    };
    addOrUpdatePayrollRecord(newRecord);
  };
  
  const calculateNetSalary = (employee: Employee, record?: PayrollRecord): number => {
    const baseSalary = employee.salary;
    const attendance = record?.attendanceDays ?? 30;
    const deductions = record?.deductions ?? 0;
    const bonuses = record?.bonuses ?? 0;
    const advance = record?.advance ?? 0;
    
    const net = (baseSalary / 30 * attendance) - deductions + bonuses - advance;
    return Math.max(0, net);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">كشف الرواتب</h1>
        <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg">
          <button onClick={() => handleMonthChange(1)} className="text-white p-2 hover:bg-gray-700 rounded-md">{"<"}</button>
          <span className="font-bold text-lg text-orange-400">
            {currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => handleMonthChange(-1)} className="text-white p-2 hover:bg-gray-700 rounded-md">{">"}</button>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">الموظف</th>
                <th scope="col" className="px-4 py-3">الراتب الأساسي</th>
                <th scope="col" className="px-4 py-3">أيام الحضور</th>
                <th scope="col" className="px-4 py-3">أيام الغياب</th>
                <th scope="col" className="px-4 py-3">الخصومات</th>
                <th scope="col" className="px-4 py-3">المكافآت</th>
                <th scope="col" className="px-4 py-3">السلفة</th>
                <th scope="col" className="px-4 py-3">صافي الراتب</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee: Employee) => {
                const record = payrollRecords.find(r => r.employeeId === employee.id && r.year === year && r.month === month);
                const attendance = record?.attendanceDays ?? 30;
                const absence = 30 - attendance;
                const netSalary = calculateNetSalary(employee, record);

                return (
                  <tr key={employee.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={employee.photoUrl} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono">{employee.salary.toFixed(2)} د.ك</td>
                    <td className="px-4 py-4 w-32">
                        <input 
                            type="number" 
                            min="0" max="30"
                            defaultValue={attendance}
                            onBlur={(e) => handlePayrollChange(employee.id, 'attendanceDays', parseInt(e.target.value, 10))}
                            className="w-20 bg-gray-800 border border-gray-500 rounded-md py-1 px-2 text-white text-center" 
                        />
                    </td>
                    <td className="px-4 py-4 text-center">{absence}</td>
                    <td className="px-4 py-4 w-32">
                        <input 
                            type="number" 
                            min="0" step="0.01"
                            defaultValue={record?.deductions || 0}
                            onBlur={(e) => handlePayrollChange(employee.id, 'deductions', parseFloat(e.target.value))}
                            className="w-24 bg-gray-800 border border-gray-500 rounded-md py-1 px-2 text-white text-center" 
                        />
                    </td>
                    <td className="px-4 py-4 w-32">
                         <input 
                            type="number" 
                            min="0" step="0.01"
                            defaultValue={record?.bonuses || 0}
                            onBlur={(e) => handlePayrollChange(employee.id, 'bonuses', parseFloat(e.target.value))}
                            className="w-24 bg-gray-800 border border-gray-500 rounded-md py-1 px-2 text-white text-center" 
                        />
                    </td>
                    <td className="px-4 py-4 w-32">
                         <input 
                            type="number" 
                            min="0" step="0.01"
                            defaultValue={record?.advance || 0}
                            onBlur={(e) => handlePayrollChange(employee.id, 'advance', parseFloat(e.target.value))}
                            className="w-24 bg-gray-800 border border-gray-500 rounded-md py-1 px-2 text-white text-center" 
                        />
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-orange-400 text-lg">
                      {netSalary.toFixed(2)} د.ك
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
