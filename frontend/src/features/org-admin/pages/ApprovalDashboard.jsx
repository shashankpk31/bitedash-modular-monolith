import React, { useState, useEffect } from 'react';
import { orgAdminService } from '../services/orgAdminService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Users, Store, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { USER_STATUS } from '../../../config/constants';
import { MSG, ERR } from '../../../config/errMsgConstants';

const ApprovalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const data = await orgAdminService.getPendingApprovals();
      setRequests(data);
    } catch (err) {
      toast.error(err || ERR.FETCH_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = async (userId, newStatus) => {
    const actionType = newStatus === USER_STATUS.ACTIVE ? "approving" : "rejecting";
    const loadingToast = toast.loading(`Please wait, ${actionType} user...`);

    try {
      
      await orgAdminService.updateUserStatus(userId, newStatus);

      setRequests((prev) => prev.filter((user) => user.id !== userId));

      toast.success(
        newStatus === USER_STATUS.ACTIVE ? MSG.USER_APPROVED : MSG.USER_REJECTED,
        { id: loadingToast }
      );
    } catch (err) {
      toast.error(err || ERR.ACTION_FAILED, { id: loadingToast });
    }
  };

  const filteredRequests = filter === "ALL"
    ? requests
    : requests.filter((r) => r.role === `ROLE_${filter}`);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Approvals Required</h1>
        <p className="text-gray-500 mt-2">Verify and manage access for Employees and Vendors.</p>
      </header>

      {}
      <div className="flex gap-4">
        {['ALL', 'EMPLOYEE', 'VENDOR'].map(type => (
          <Button
            key={type}
            variant={filter === type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Fetching pending requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(user => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${user.role === 'ROLE_VENDOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {user.role === 'ROLE_VENDOR' ? <Store size={24} /> : <Users size={24} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {user.role.split('_')[1]}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-500 mb-6">{user.email}</p>

              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1 text-green-600 bg-green-50 hover:bg-green-100"
                  onClick={() => handleAction(user.id, USER_STATUS.ACTIVE)}
                >
                  <CheckCircle size={18} className="mr-2" /> Approve
                </Button>
                <Button 
                  variant="danger" 
                  className="px-4"
                  onClick={() => handleAction(user.id, USER_STATUS.BLOCKED)}
                >
                  <XCircle size={18} />
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-medium bg-gray-50 rounded-hb border-2 border-dashed border-gray-200">
              No pending {filter.toLowerCase()} requests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;