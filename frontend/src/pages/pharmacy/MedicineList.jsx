import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pharmacyService } from '../../services/pharmacyService';
import { Pill, Plus, Search, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const MedicineList = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isLowStock, setIsLowStock] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  
  const isAdminOrPharmacist = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACIST'].includes(user?.role);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pharmacyService.getMedicines({ 
        search, 
        isLowStock: isLowStock ? 'true' : undefined,
        isExpiring: isExpiring ? 'true' : undefined
      });
      setMedicines(res.data?.medicines || []);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  }, [search, isLowStock, isExpiring]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMedicines();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchMedicines]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await pharmacyService.deleteMedicine(id);
        toast.success('Medicine deleted successfully');
        fetchMedicines();
      } catch (error) {
        toast.error('Failed to delete medicine');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Pill className="w-6 h-6 mr-2 text-indigo-600" />
            Pharmacy Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage medicines, stock, and expiries.</p>
        </div>
        {isAdminOrPharmacist && (
          <Link
            to="/dashboard/pharmacy/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Medicine
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search medicines by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={isLowStock} onChange={(e) => setIsLowStock(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Low Stock</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={isExpiring} onChange={(e) => setIsExpiring(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Expiring Soon</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading inventory...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((med) => {
                const lowStock = med.stock < 20;
                const expiringSoon = new Date(med.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 30));
                
                return (
                  <tr key={med._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{med.name}</div>
                      <div className="text-xs text-gray-500">{med.dosage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {med.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${expiringSoon ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {expiringSoon && <AlertTriangle className="w-4 h-4 mr-1" />}
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isAdminOrPharmacist && (
                        <div className="flex justify-end gap-3">
                          <Link to={`/dashboard/pharmacy/edit/${med._id}`} className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(med._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No medicines found matching the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicineList;
