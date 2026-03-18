import React, { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import Badge from '../../../components/ui/Badge';

const VendorMenuMgmt = () => {
  const [menuItems, setMenuItems] = useState(mockMenu);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-background-light p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-slate-500">Manage your food items</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-primary text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
          <Icon name="add" /> Add Item
        </button>
      </header>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="mb-4 flex gap-2">
          <input type="text" placeholder="Search menu items..." className="flex-1 px-4 py-2 rounded-lg border" />
          <button className="px-4 py-2 bg-slate-100 rounded-lg"><Icon name="filter_list" /></button>
        </div>

        <div className="space-y-3">
          {menuItems.map(item => (
            <div key={item.id} className="flex gap-4 p-3 border rounded-xl hover:bg-slate-50">
              <img src={item.image} className="w-20 h-20 rounded-lg object-cover" alt={item.name} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold">{item.name}</h3>
                  <Badge variant={item.available ? 'success' : 'danger'} size="xs">
                    {item.available ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{item.category}</p>
                <p className="font-bold text-primary">${item.price}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2 hover:bg-slate-100 rounded"><Icon name="edit" size={18} /></button>
                <button className="p-2 hover:bg-red-50 text-red-600 rounded"><Icon name="delete" size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mockMenu = [
  { id: 1, name: 'Burger', category: 'Fast Food', price: 12.50, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { id: 2, name: 'Salad Bowl', category: 'Healthy', price: 10.00, available: true, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
];

export default VendorMenuMgmt;
