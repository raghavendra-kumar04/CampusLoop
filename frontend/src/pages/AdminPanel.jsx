import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, listings, reports, activity
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('all');
  const [listingVisibilityFilter, setListingVisibilityFilter] = useState('all');
  const [editingListing, setEditingListing] = useState(null);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [actioningReport, setActioningReport] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Restrict modal state
  const [restrictModalUser, setRestrictModalUser] = useState(null);
  const [restrictDays, setRestrictDays] = useState(7);
  const [restrictReason, setRestrictReason] = useState('');

  // Confirm delete modal
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'user' | 'listing', id, name }

  // 1. Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      toast.error('Failed to load admin stats');
    }
  }, []);

  // 2. Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = {};
      if (userSearch.trim()) params.search = userSearch.trim();
      if (userStatusFilter !== 'all') params.status = userStatusFilter;
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      const res = await axios.get('/api/admin/users', { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to fetch user list');
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userStatusFilter, userRoleFilter]);

  // 3. Fetch listings
  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const params = {};
      if (listingSearch.trim()) params.search = listingSearch.trim();
      if (listingCategoryFilter !== 'all') params.category = listingCategoryFilter;
      if (listingVisibilityFilter !== 'all') params.hidden = listingVisibilityFilter === 'hidden';
      const res = await axios.get('/api/admin/listings', { params });
      setListings(res.data.listings || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      toast.error('Failed to fetch listings');
    } finally {
      setListingsLoading(false);
    }
  }, [listingSearch, listingCategoryFilter, listingVisibilityFilter]);

  // 4. Fetch reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const params = {};
      if (reportStatusFilter !== 'all') params.status = reportStatusFilter;
      const res = await axios.get('/api/admin/reports', { params });
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      toast.error('Failed to fetch reports');
    } finally {
      setReportsLoading(false);
    }
  }, [reportStatusFilter]);

  // Initial load
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Unauthorized access. Admin privileges required.');
      navigate('/');
      return;
    }

    const init = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    init();
  }, [isAdmin, navigate, fetchStats]);

  // Tab switch effect
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'listings') fetchListings();
    else if (activeTab === 'reports') fetchReports();
    else if (activeTab === 'overview') fetchStats();
  }, [activeTab, fetchUsers, fetchListings, fetchReports, fetchStats]);

  // User Actions
  const handleUpdateUserStatus = async (userId, newStatus, reason = '', days = 0) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/status`, {
        status: newStatus,
        reason,
        days,
      });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
      fetchStats();
      if (restrictModalUser) setRestrictModalUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User and associated data deleted.');
      setDeleteConfirm(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUserDetail = async (userId) => {
    try {
      const res = await axios.get(`/api/admin/users/${userId}`);
      setSelectedUserDetail(res.data);
      setDetailModalOpen(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  // Listing Actions
  const handleToggleListingVisibility = async (listingId, currentlyHidden) => {
    try {
      await axios.patch(`/api/admin/listings/${listingId}/visibility`, {
        isHidden: !currentlyHidden,
        note: !currentlyHidden ? 'Hidden by administrator' : '',
      });
      toast.success(currentlyHidden ? 'Listing is now visible' : 'Listing has been hidden');
      fetchListings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await axios.delete(`/api/admin/listings/${listingId}`);
      toast.success('Listing permanently deleted');
      setDeleteConfirm(null);
      fetchListings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      await axios.patch(`/api/admin/listings/${editingListing._id}`, {
        title: editingListing.title,
        price: editingListing.price,
        status: editingListing.status,
        category: editingListing.category,
      });
      toast.success('Listing updated successfully');
      setEditingListing(null);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    }
  };

  // Report Actions
  const handleResolveReport = async (reportId, status, note) => {
    try {
      await axios.patch(`/api/admin/reports/${reportId}`, {
        status,
        adminNote: note || 'Resolved by administrator',
      });
      toast.success(`Report marked as ${status}`);
      setActioningReport(null);
      setAdminNoteInput('');
      fetchReports();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report');
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="admin-wrapper flex items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      {/* Top Banner / Navigation */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-badge">
            <span className="material-symbols-outlined">shield_person</span>
            ADMIN CONSOLE
          </div>
          <h1>CampusLoop Control Center</h1>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-user-info">Logged in as <b>{user?.name || user?.email}</b></span>
          <button onClick={() => navigate('/marketplace')} className="btn-secondary-sm">
            <span className="material-symbols-outlined">storefront</span>
            Back to Marketplace
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="material-symbols-outlined">group</span>
          Users ({stats?.counts?.users || users.length || 0})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          <span className="material-symbols-outlined">inventory_2</span>
          Listings ({stats?.counts?.listings || listings.length || 0})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <span className="material-symbols-outlined">flag</span>
          Reports ({stats?.counts?.pendingReports ? `${stats.counts.pendingReports} pending` : (stats?.counts?.reports || 0)})
          {stats?.counts?.pendingReports > 0 && (
            <span className="admin-pill-badge">{stats.counts.pendingReports}</span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="admin-overview-section">
            {/* Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-users" onClick={() => setActiveTab('users')}>
                <div className="stat-icon-wrap">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="stat-details">
                  <span className="stat-title">Total Registered Students</span>
                  <div className="stat-number">{stats?.counts?.users || 0}</div>
                  <span className="stat-sub">
                    <b>{stats?.userStatusCounts?.active || 0}</b> Active • <b>{stats?.userStatusCounts?.blocked || 0}</b> Blocked • <b>{stats?.userStatusCounts?.restricted || 0}</b> Restricted
                  </span>
                </div>
              </div>

              <div className="stat-card stat-listings" onClick={() => setActiveTab('listings')}>
                <div className="stat-icon-wrap">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div className="stat-details">
                  <span className="stat-title">Active Market Listings</span>
                  <div className="stat-number">{stats?.counts?.listings || 0}</div>
                  <span className="stat-sub">
                    <b>{stats?.counts?.hiddenListings || 0}</b> hidden by admin
                  </span>
                </div>
              </div>

              <div className="stat-card stat-reports" onClick={() => setActiveTab('reports')}>
                <div className="stat-icon-wrap">
                  <span className="material-symbols-outlined">flag</span>
                </div>
                <div className="stat-details">
                  <span className="stat-title">Reports & Flags</span>
                  <div className="stat-number">{stats?.counts?.pendingReports || 0}</div>
                  <span className="stat-sub text-amber-500">
                    {stats?.counts?.pendingReports || 0} pending review ({stats?.counts?.reports || 0} total)
                  </span>
                </div>
              </div>

              <div className="stat-card stat-actions">
                <div className="stat-icon-wrap">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div className="stat-details">
                  <span className="stat-title">Platform Protection</span>
                  <div className="stat-number">Active</div>
                  <span className="stat-sub">Live fraud and community safety filtering</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Pending Reports Preview */}
            <div className="overview-split">
              <div className="overview-card">
                <div className="overview-card-header">
                  <h3>
                    <span className="material-symbols-outlined">warning</span>
                    Needs Immediate Attention ({stats?.counts?.pendingReports || 0})
                  </h3>
                  <button onClick={() => setActiveTab('reports')} className="text-btn">View All</button>
                </div>
                {stats?.pendingReportsList && stats.pendingReportsList.length > 0 ? (
                  <div className="pending-reports-list">
                    {stats.pendingReportsList.map(rep => (
                      <div key={rep._id} className="pending-report-row">
                        <div className="report-badge-reason">{rep.reason}</div>
                        <div className="report-row-body">
                          <p>
                            <b>{rep.reporter?.name}</b> reported <b>{rep.reportedUser?.name}</b>
                          </p>
                          <span className="report-row-desc">"{rep.description || 'No description provided'}"</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('reports');
                            setActioningReport(rep);
                          }}
                          className="btn-action-sm"
                        >
                          Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-sm">
                    <span className="material-symbols-outlined">verified</span>
                    <p>All reports have been addressed. Clear queue!</p>
                  </div>
                )}
              </div>

              <div className="overview-card">
                <div className="overview-card-header">
                  <h3>
                    <span className="material-symbols-outlined">bolt</span>
                    Quick Management Actions
                  </h3>
                </div>
                <div className="quick-actions-grid">
                  <button onClick={() => setActiveTab('users')} className="quick-act-card">
                    <span className="material-symbols-outlined">person_add_disabled</span>
                    <div>
                      <h4>Manage Suspensions</h4>
                      <p>Block or restrict malicious accounts</p>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab('listings')} className="quick-act-card">
                    <span className="material-symbols-outlined">visibility_off</span>
                    <div>
                      <h4>Takedown Listings</h4>
                      <p>Hide fraudulent or inappropriate items</p>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="quick-act-card">
                    <span className="material-symbols-outlined">gavel</span>
                    <div>
                      <h4>Investigate Reports</h4>
                      <p>Review community alerts</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: USERS ================= */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            {/* Controls Bar */}
            <div className="table-controls-bar">
              <div className="search-input-wrap">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                />
              </div>

              <div className="filter-group">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked / Suspended</option>
                  <option value="restricted">Restricted</option>
                </select>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Students (Users)</option>
                  <option value="admin">Administrators</option>
                </select>

                <button onClick={fetchUsers} className="btn-secondary-sm">
                  <span className="material-symbols-outlined">refresh</span>
                  Filter
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Flags / Reports</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-outline">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u._id} className={u.status === 'blocked' ? 'row-blocked' : ''}>
                        <td>
                          <div className="user-table-cell">
                            <div className="user-avatar-sm">
                              {u.avatar ? <img src={u.avatar} alt="" /> : <span>{u.name?.[0]?.toUpperCase()}</span>}
                            </div>
                            <div>
                              <div className="user-name-bold">{u.name}</div>
                              <div className="user-email-dim">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${u.status || 'active'}`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="reports-counter">
                            <span className={u.reportCount > 0 ? 'text-red-500 font-bold' : 'text-outline'}>
                              {u.reportCount || 0} reports
                            </span>
                            {u.warningCount > 0 && (
                              <span className="text-amber-500 text-xs">({u.warningCount} warnings)</span>
                            )}
                          </div>
                        </td>
                        <td className="text-xs text-outline">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button
                              onClick={() => handleViewUserDetail(u._id)}
                              className="action-btn view-btn"
                              title="View Full Profile Details"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>

                            {/* Status Change Buttons */}
                            {u.status === 'blocked' ? (
                              <button
                                onClick={() => handleUpdateUserStatus(u._id, 'active')}
                                className="action-btn unblock-btn"
                                title="Unblock / Reactivate"
                              >
                                <span className="material-symbols-outlined">lock_open</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateUserStatus(u._id, 'blocked', 'Suspended by admin')}
                                className="action-btn block-btn"
                                title="Block User"
                              >
                                <span className="material-symbols-outlined">block</span>
                              </button>
                            )}

                            {u.status === 'restricted' ? (
                              <button
                                onClick={() => handleUpdateUserStatus(u._id, 'active')}
                                className="action-btn unblock-btn"
                                title="Remove Restrictions"
                              >
                                <span className="material-symbols-outlined">check_circle</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setRestrictModalUser(u)}
                                className="action-btn restrict-btn"
                                title="Restrict User Temporarily"
                              >
                                <span className="material-symbols-outlined">timer</span>
                              </button>
                            )}

                            {/* Role Toggle */}
                            <button
                              onClick={() => handleToggleUserRole(u._id, u.role)}
                              className="action-btn role-btn"
                              title={u.role === 'admin' ? 'Demote to regular student' : 'Promote to Admin'}
                            >
                              <span className="material-symbols-outlined">
                                {u.role === 'admin' ? 'person_remove' : 'verified_user'}
                              </span>
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => setDeleteConfirm({ type: 'user', id: u._id, name: u.name })}
                              className="action-btn delete-btn"
                              title="Delete User Permanently"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: LISTINGS ================= */}
        {activeTab === 'listings' && (
          <div className="admin-tab-content">
            {/* Controls Bar */}
            <div className="table-controls-bar">
              <div className="search-input-wrap">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Search product title..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
                />
              </div>

              <div className="filter-group">
                <select
                  value={listingCategoryFilter}
                  onChange={(e) => setListingCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Textbooks">Textbooks</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Dorm Gear">Dorm Gear</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Tickets">Tickets</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={listingVisibilityFilter}
                  onChange={(e) => setListingVisibilityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Visibility</option>
                  <option value="visible">Visible Only</option>
                  <option value="hidden">Hidden by Admin</option>
                </select>

                <button onClick={fetchListings} className="btn-secondary-sm">
                  <span className="material-symbols-outlined">refresh</span>
                  Filter
                </button>
              </div>
            </div>

            {/* Listings Table */}
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listingsLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                      </td>
                    </tr>
                  ) : listings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-outline">
                        No listings match your search.
                      </td>
                    </tr>
                  ) : (
                    listings.map(item => (
                      <tr key={item._id} className={item.isHidden ? 'row-hidden' : ''}>
                        <td>
                          <div className="item-table-cell">
                            <div className="item-thumb-sm">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt="" />
                              ) : (
                                <span className="material-symbols-outlined">image</span>
                              )}
                            </div>
                            <div className="item-title-clamp" title={item.title}>
                              {item.title}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="seller-info-sm">
                            <span className="font-bold">{item.seller?.name || 'Unknown'}</span>
                            <span className="text-xs text-outline">{item.seller?.email}</span>
                          </div>
                        </td>
                        <td className="font-bold text-primary">₹{item.price}</td>
                        <td>
                          <span className="category-pill">{item.category}</span>
                        </td>
                        <td>
                          <span className={`status-pill status-${(item.status || 'Available').toLowerCase()}`}>
                            {item.status || 'Available'}
                          </span>
                        </td>
                        <td>
                          {item.isHidden ? (
                            <span className="visibility-badge hidden-badge">
                              <span className="material-symbols-outlined">visibility_off</span> Hidden
                            </span>
                          ) : (
                            <span className="visibility-badge visible-badge">
                              <span className="material-symbols-outlined">visibility</span> Public
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            {/* Toggle Visibility */}
                            <button
                              onClick={() => handleToggleListingVisibility(item._id, item.isHidden)}
                              className={`action-btn ${item.isHidden ? 'unblock-btn' : 'block-btn'}`}
                              title={item.isHidden ? 'Make Public' : 'Hide from Marketplace'}
                            >
                              <span className="material-symbols-outlined">
                                {item.isHidden ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>

                            {/* Edit Listing Modal trigger */}
                            <button
                              onClick={() => setEditingListing(item)}
                              className="action-btn view-btn"
                              title="Modify product details"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>

                            {/* Delete Listing */}
                            <button
                              onClick={() => setDeleteConfirm({ type: 'listing', id: item._id, name: item.title })}
                              className="action-btn delete-btn"
                              title="Delete permanently"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REPORTS ================= */}
        {activeTab === 'reports' && (
          <div className="admin-tab-content">
            {/* Filter */}
            <div className="table-controls-bar">
              <div className="filter-group">
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending Review</option>
                  <option value="actioned">Actioned</option>
                  <option value="dismissed">Dismissed</option>
                </select>

                <button onClick={fetchReports} className="btn-secondary-sm">
                  <span className="material-symbols-outlined">refresh</span>
                  Refresh
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="reports-container">
              {reportsLoading ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="empty-reports-card">
                  <span className="material-symbols-outlined">check_circle</span>
                  <h3>No reports found</h3>
                  <p>CampusLoop community is healthy and safe!</p>
                </div>
              ) : (
                <div className="reports-grid">
                  {reports.map(rep => (
                    <div key={rep._id} className={`report-card report-status-${rep.status}`}>
                      <div className="report-card-top">
                        <div className="report-category-badge">{rep.reason}</div>
                        <span className={`status-pill status-${rep.status}`}>{rep.status}</span>
                      </div>

                      <div className="report-parties">
                        <div className="party-box reporter-box">
                          <span className="party-label">Reported By:</span>
                          <span className="party-name">{rep.reporter?.name}</span>
                          <span className="party-email">{rep.reporter?.email}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline">arrow_forward</span>
                        <div className="party-box reported-box">
                          <span className="party-label">Reported User:</span>
                          <span className="party-name font-bold text-red-500">{rep.reportedUser?.name}</span>
                          <span className="party-email">{rep.reportedUser?.email}</span>
                        </div>
                      </div>

                      {rep.reportedListing && (
                        <div className="report-listing-attachment">
                          <span className="material-symbols-outlined">inventory_2</span>
                          <span>Listing: <b>{rep.reportedListing.title}</b></span>
                        </div>
                      )}

                      <div className="report-description-box">
                        <p>"{rep.description || 'No user explanation given.'}"</p>
                        <span className="report-time">
                          Filed on {new Date(rep.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {rep.adminNote && (
                        <div className="report-resolution-note">
                          <b>Admin note:</b> {rep.adminNote}
                        </div>
                      )}

                      {/* Action buttons */}
                      {rep.status === 'pending' && (
                        <div className="report-actions-row">
                          <button
                            onClick={() => {
                              setActioningReport(rep);
                              setAdminNoteInput('');
                            }}
                            className="btn-resolve-report"
                          >
                            <span className="material-symbols-outlined">gavel</span>
                            Take Action
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'dismissed', 'Dismissed as non-violating')}
                            className="btn-dismiss-report"
                          >
                            <span className="material-symbols-outlined">close</span>
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: Actioning Report ================= */}
      {actioningReport && (
        <div className="modal-backdrop" onClick={() => setActioningReport(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Take Moderation Action on Report</h3>
              <button onClick={() => setActioningReport(null)} className="btn-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Report against <b>{actioningReport.reportedUser?.name}</b> for <b>{actioningReport.reason}</b>
              </p>
              
              <div className="form-group">
                <label>Admin Resolution Note</label>
                <textarea
                  rows="3"
                  placeholder="Specify findings, reason for moderation action, or advice for the user..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                />
              </div>

              <div className="modal-action-options">
                <button
                  onClick={async () => {
                    await handleUpdateUserStatus(actioningReport.reportedUser._id, 'blocked', adminNoteInput || 'Suspended via report');
                    await handleResolveReport(actioningReport._id, 'actioned', adminNoteInput || 'User suspended');
                  }}
                  className="btn-danger-full"
                >
                  <span className="material-symbols-outlined">block</span>
                  Suspend User & Resolve Report
                </button>

                {actioningReport.reportedListing && (
                  <button
                    onClick={async () => {
                      await handleToggleListingVisibility(actioningReport.reportedListing._id, false);
                      await handleResolveReport(actioningReport._id, 'actioned', adminNoteInput || 'Listing removed');
                    }}
                    className="btn-warning-full"
                  >
                    <span className="material-symbols-outlined">visibility_off</span>
                    Hide Listing & Resolve Report
                  </button>
                )}

                <button
                  onClick={() => handleResolveReport(actioningReport._id, 'actioned', adminNoteInput || 'Warning issued and noted')}
                  className="btn-success-full"
                >
                  <span className="material-symbols-outlined">check</span>
                  Mark as Actioned (Warned / Handled)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Restrict User ================= */}
      {restrictModalUser && (
        <div className="modal-backdrop" onClick={() => setRestrictModalUser(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Temporarily Restrict {restrictModalUser.name}</h3>
              <button onClick={() => setRestrictModalUser(null)} className="btn-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Restriction Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={restrictDays}
                  onChange={(e) => setRestrictDays(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Reason / Admin Note</label>
                <textarea
                  rows="3"
                  placeholder="Reason for temporary restriction..."
                  value={restrictReason}
                  onChange={(e) => setRestrictReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button onClick={() => setRestrictModalUser(null)} className="btn-secondary">Cancel</button>
                <button
                  onClick={() => handleUpdateUserStatus(restrictModalUser._id, 'restricted', restrictReason, restrictDays)}
                  className="btn-warning"
                >
                  Apply Restriction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Edit Listing ================= */}
      {editingListing && (
        <div className="modal-backdrop" onClick={() => setEditingListing(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Listing Details</h3>
              <button onClick={() => setEditingListing(null)} className="btn-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateListing} className="modal-body">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  value={editingListing.title}
                  onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  value={editingListing.price}
                  onChange={(e) => setEditingListing({ ...editingListing, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingListing.category}
                  onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Textbooks">Textbooks</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Dorm Gear">Dorm Gear</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Tickets">Tickets</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingListing.status}
                  onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingListing(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: User Details Full View ================= */}
      {detailModalOpen && selectedUserDetail && (
        <div className="modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div className="admin-modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile & History</h3>
              <button onClick={() => setDetailModalOpen(false)} className="btn-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-card">
                <div className="user-avatar-lg">
                  {selectedUserDetail.user?.avatar ? (
                    <img src={selectedUserDetail.user.avatar} alt="" />
                  ) : (
                    <span>{selectedUserDetail.user?.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2>{selectedUserDetail.user?.name}</h2>
                  <p>{selectedUserDetail.user?.email}</p>
                  <div className="detail-tags">
                    <span className={`role-badge role-${selectedUserDetail.user?.role}`}>
                      {selectedUserDetail.user?.role}
                    </span>
                    <span className={`status-badge status-${selectedUserDetail.user?.status}`}>
                      {selectedUserDetail.user?.status}
                    </span>
                    <span>Major: {selectedUserDetail.user?.major || 'N/A'}</span>
                    <span>Class of {selectedUserDetail.user?.graduationYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* User Listings Section */}
              <div className="sub-section">
                <h4>Listings by this user ({selectedUserDetail.listings?.length || 0})</h4>
                <div className="mini-listings-grid">
                  {selectedUserDetail.listings?.map(l => (
                    <div key={l._id} className="mini-listing-card">
                      <img src={l.images?.[0]} alt="" />
                      <div>
                        <h5>{l.title}</h5>
                        <p>₹{l.price} • {l.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports Against User */}
              {selectedUserDetail.reportsAgainst?.length > 0 && (
                <div className="sub-section">
                  <h4 className="text-red-500">Reports filed against this user ({selectedUserDetail.reportsAgainst.length})</h4>
                  <div className="mini-reports-list">
                    {selectedUserDetail.reportsAgainst.map(r => (
                      <div key={r._id} className="mini-report-item">
                        <b>{r.reason}</b>: {r.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: Delete Confirmation ================= */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-red-500">Confirm Deletion</h3>
              <button onClick={() => setDeleteConfirm(null)} className="btn-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete this {deleteConfirm.type}:
              </p>
              <p className="font-bold my-2 text-lg">"{deleteConfirm.name}"</p>
              <p className="text-sm text-outline">
                This action cannot be undone. All associated data will be removed.
              </p>
              <div className="modal-footer mt-4">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'user') handleDeleteUser(deleteConfirm.id);
                    else if (deleteConfirm.type === 'listing') handleDeleteListing(deleteConfirm.id);
                  }}
                  className="btn-danger"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
