import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './BlockReportModal.css';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Unwanted Content' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'fake_listing', label: 'Fake or Misleading Listing' },
  { value: 'fraud', label: 'Fraud or Scam Attempt' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'scam', label: 'Suspicious Behaviour' },
  { value: 'other', label: 'Other' },
];

const BlockReportModal = ({ targetUser, listingId, onClose, onBlockSuccess }) => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'block'
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isBlocked = user?.blockedUsers?.map(id => id.toString()).includes(targetUser?._id?.toString());

  const handleReport = async () => {
    if (!reason) return toast.error('Please select a reason for your report.');
    setLoading(true);
    try {
      await axios.post(`/api/reports/user/${targetUser._id}`, { reason, description, listingId });
      toast.success('Report submitted. Our team will review it shortly.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      if (isBlocked) {
        await axios.post(`/api/users/${targetUser._id}/unblock`);
        setUser(prev => ({
          ...prev,
          blockedUsers: (prev.blockedUsers || []).filter(id => id.toString() !== targetUser._id.toString()),
        }));
        toast.success(`${targetUser.name} has been unblocked.`);
      } else {
        await axios.post(`/api/users/${targetUser._id}/block`);
        setUser(prev => ({
          ...prev,
          blockedUsers: [...(prev.blockedUsers || []), targetUser._id],
        }));
        toast.success(`${targetUser.name} has been blocked. Their listings will no longer appear to you.`);
      }
      if (onBlockSuccess) onBlockSuccess(!isBlocked);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brm-overlay" onClick={onClose}>
      <div className="brm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="brm-header">
          <div className="brm-avatar">
            {targetUser?.avatar
              ? <img src={targetUser.avatar} alt={targetUser.name} />
              : <span>{targetUser?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="brm-user-info">
            <h3>{targetUser?.name}</h3>
            <p>{targetUser?.email}</p>
          </div>
          <button className="brm-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="brm-tabs">
          <button
            className={`brm-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <span className="material-symbols-outlined">flag</span>
            Report User
          </button>
          <button
            className={`brm-tab ${activeTab === 'block' ? 'active' : ''}`}
            onClick={() => setActiveTab('block')}
          >
            <span className="material-symbols-outlined">block</span>
            {isBlocked ? 'Unblock User' : 'Block User'}
          </button>
        </div>

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="brm-body">
            <p className="brm-desc">
              Reports are reviewed by our team. Repeated misuse of this feature may result in your account being restricted.
            </p>
            <div className="brm-reason-grid">
              {REPORT_REASONS.map(r => (
                <label key={r.value} className={`brm-reason-chip ${reason === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="reason" value={r.value} onChange={() => setReason(r.value)} hidden />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              className="brm-textarea"
              placeholder="Additional details (optional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <button
              className="brm-action-btn report-btn"
              onClick={handleReport}
              disabled={loading || !reason}
            >
              {loading ? (
                <span className="material-symbols-outlined spinning">progress_activity</span>
              ) : (
                <><span className="material-symbols-outlined">flag</span> Submit Report</>
              )}
            </button>
          </div>
        )}

        {/* Block Tab */}
        {activeTab === 'block' && (
          <div className="brm-body">
            {isBlocked ? (
              <>
                <div className="brm-block-info unblock">
                  <span className="material-symbols-outlined">lock_open</span>
                  <div>
                    <h4>Unblock {targetUser?.name}?</h4>
                    <p>They will be able to see your profile and listings will reappear for you.</p>
                  </div>
                </div>
                <button className="brm-action-btn unblock-btn" onClick={handleBlock} disabled={loading}>
                  {loading ? <span className="material-symbols-outlined spinning">progress_activity</span>
                    : <><span className="material-symbols-outlined">lock_open</span> Unblock User</>}
                </button>
              </>
            ) : (
              <>
                <div className="brm-block-info">
                  <span className="material-symbols-outlined">block</span>
                  <div>
                    <h4>Block {targetUser?.name}?</h4>
                    <p>Their listings will disappear from your feed. You won't see each other's content. They are not notified.</p>
                  </div>
                </div>
                <button className="brm-action-btn block-btn" onClick={handleBlock} disabled={loading}>
                  {loading ? <span className="material-symbols-outlined spinning">progress_activity</span>
                    : <><span className="material-symbols-outlined">block</span> Block User</>}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockReportModal;
