
import React, { useState } from 'react';
import { useData } from '../../data/DataContext';
import { Employee, UserRole } from '../../types';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons/IconComponents';

const EmployeesManagement: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAddClick = () => {
    setModalMode('add');
    setSelectedEmployee(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (employee: Employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setImagePreview(employee.photoUrl);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsConfirmOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setImagePreview(null);
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
    }
    setIsConfirmOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let photoUrl = selectedEmployee?.photoUrl || `https://i.pravatar.cc/150?u=${Date.now()}`;
    const imageFile = formData.get('photo') as File;

    if (imageFile && imageFile.size > 0) {
        photoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    const employeeData: Employee = {
      id: selectedEmployee?.id || `emp-${Date.now()}`,
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string || selectedEmployee?.password || 'password',
      role: UserRole.Employee,
      permissions: selectedEmployee?.permissions || {
          dashboard: true, menu: false, subscribers: false, packages: false, 
          discounts: false, reports: false, employees: false, permissions: false
      },
      photoUrl,
      phone: formData.get('phone') as string,
      civilId: formData.get('civilId') as string,
      age: Number(formData.get('age')),
      jobTitle: formData.get('jobTitle') as string,
      salary: Number(formData.get('salary')),
      address: formData.get('address') as string,
      bankName: formData.get('bankName') as string,
      iban: formData.get('iban') as string,
      hireDate: formData.get('hireDate') as string,
      startDate: formData.get('startDate') as string,
    };
    
    if (modalMode === 'add') {
      addEmployee(employeeData);
    } else {
      updateEmployee(employeeData);
    }
    
    handleCloseModal();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">إدارة الموظفين</h1>
        <button onClick={handleAddClick} className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
          <PlusIcon />
          إضافة موظف
        </button>
      </div>

      <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-right text-gray-300">
            <thead className="text-xs text-gray-300 uppercase bg-gray-600">
              <tr>
                <th scope="col" className="px-6 py-3">الموظف</th>
                <th scope="col" className="px-6 py-3">الوظيفة</th>
                <th scope="col" className="px-6 py-3">اسم المستخدم</th>
                <th scope="col" className="px-6 py-3">رقم الهاتف</th>
                <th scope="col" className="px-6 py-3">الراتب</th>
                <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee: Employee) => (
                <tr key={employee.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <img src={employee.photoUrl} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                        <span>{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{employee.jobTitle}</td>
                  <td className="px-6 py-4 font-mono">{employee.username}</td>
                  <td className="px-6 py-4">{employee.phone}</td>
                  <td className="px-6 py-4 font-mono">{employee.salary.toFixed(2)} د.ك</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEditClick(employee)} className="font-medium text-blue-400 hover:underline"><EditIcon /></button>
                    <button onClick={() => handleDeleteClick(employee)} className="font-medium text-red-400 hover:underline mr-4"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalMode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
      >
        <form onSubmit={handleSaveChanges} className="space-y-4 text-right">
          
          <div className="flex items-center gap-4">
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-500" />}
               <div className="flex-1">
                <label htmlFor="photo" className="block text-sm font-medium text-gray-300">صورة الموظف</label>
                <input 
                    type="file" 
                    id="photo" 
                    name="photo" 
                    accept="image/*" 
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                    }}
                    className="mt-1 block w-full text-sm text-gray-400 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
              </div>
          </div>

           <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-orange-400">بيانات تسجيل الدخول</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">اسم المستخدم</label>
                  <input type="text" id="username" name="username" defaultValue={selectedEmployee?.username} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">كلمة المرور</label>
                  <input type="password" id="password" name="password" placeholder={modalMode === 'edit' ? 'اتركه فارغاً لعدم التغيير' : ''} required={modalMode === 'add'} className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
                </div>
            </div>
          </fieldset>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">الاسم الكامل</label>
              <input type="text" id="name" name="name" defaultValue={selectedEmployee?.name} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف</label>
              <input type="tel" id="phone" name="phone" defaultValue={selectedEmployee?.phone} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
             <div>
              <label htmlFor="civilId" className="block text-sm font-medium text-gray-300 mb-1">رقم بطاقة مدنية</label>
              <input type="text" id="civilId" name="civilId" defaultValue={selectedEmployee?.civilId} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
             <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">السن</label>
              <input type="number" id="age" name="age" defaultValue={selectedEmployee?.age} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
             <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300 mb-1">طبيعة العمل</label>
              <input type="text" id="jobTitle" name="jobTitle" defaultValue={selectedEmployee?.jobTitle} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
             <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-1">الراتب الشهري (د.ك)</label>
              <input type="number" step="0.01" id="salary" name="salary" defaultValue={selectedEmployee?.salary} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-300 mb-1">تاريخ التعيين</label>
              <input type="date" id="hireDate" name="hireDate" defaultValue={selectedEmployee?.hireDate} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">بداية العمل</label>
              <input type="date" id="startDate" name="startDate" defaultValue={selectedEmployee?.startDate} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">العنوان</label>
            <input type="text" id="address" name="address" defaultValue={selectedEmployee?.address} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">اسم البنك</label>
              <input type="text" id="bankName" name="bankName" defaultValue={selectedEmployee?.bankName} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
             <div>
              <label htmlFor="iban" className="block text-sm font-medium text-gray-300 mb-1">رقم أيبان</label>
              <input type="text" id="iban" name="iban" defaultValue={selectedEmployee?.iban} required className="block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white" />
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">حفظ التغييرات</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="تأكيد الحذف">
        <p className="text-gray-300">هل أنت متأكد من أنك تريد حذف الموظف "{selectedEmployee?.name}"؟</p>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-500 rounded-md hover:bg-gray-400">إلغاء</button>
          <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">حذف</button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesManagement;
