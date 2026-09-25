import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../utils/profile';

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const editListingId = location.state?.editListingId || null;
  const [existingImages, setExistingImages] = useState([]);

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Like New',
    listingType: 'Sell',
    location: 'Campus Library'
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileToast, setFileToast] = useState({ show: false, message: '' });

  // If not logged in, redirect to auth
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (editListingId) {
      const fetchListingToEdit = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/api/listings/${editListingId}`);
          const listData = res.data;
          setFormData({
            title: listData.title,
            description: listData.description,
            price: listData.price,
            category: listData.category,
            condition: listData.condition,
            listingType: listData.listingType,
            location: listData.location
          });
          setPreviews(listData.images);
          setExistingImages(listData.images);
        } catch (err) {
          console.error("Error fetching listing for editing:", err);
          setError("Failed to load listing details for editing.");
        } finally {
          setLoading(false);
        }
      };
      fetchListingToEdit();
    }
  }, [editListingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleConditionChange = (conditionVal) => {
    setFormData(prev => ({
      ...prev,
      condition: conditionVal
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check if any file is larger than 2MB
    const oversizedFile = selectedFiles.find(file => file.size > 2 * 1024 * 1024);
    if (oversizedFile) {
      setFileToast({ show: true, message: 'Please upload images less than 2MB' });
      setTimeout(() => setFileToast({ show: false, message: '' }), 4000);
      return;
    }

    if (files.length + selectedFiles.length > 5) {
      setError('You can upload up to 5 images maximum.');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    
    const filePreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...filePreviews]);
    setError('');
  };

  const removeFile = (index) => {
    const previewToRemove = previews[index];
    if (previewToRemove.startsWith('blob:')) {
      const fileBlobIndex = previews
        .slice(0, index)
        .filter(p => p.startsWith('blob:'))
        .length;
      setFiles(prev => prev.filter((_, i) => i !== fileBlobIndex));
    } else {
      setExistingImages(prev => prev.filter(url => url !== previewToRemove));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!isProfileComplete(user)) {
      toast.error('Please complete your profile details (Major, Graduation Year, and Bio) before listing products for sale.');
      navigate(`/profile/${user?._id}?edit=true`);
      return;
    }
    if (step === 1) {
      if (files.length === 0) {
        setError('Please upload at least one image of your item.');
        return;
      }
    } else if (step === 2) {
      if (!formData.title.trim()) {
        setError('Please enter a listing title.');
        return;
      }
      if (!formData.description.trim()) {
        setError('Please enter a description.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isProfileComplete(user)) {
      toast.error('Please complete your profile details (Major, Graduation Year, and Bio) before listing products for sale.');
      navigate(`/profile/${user?._id}?edit=true`);
      return;
    }

    const { title, description, price, category, condition, listingType, location } = formData;

    if (!title || !description || !price || !category || !condition || !location) {
      setError('Please fill in all listing details.');
      return;
    }

    if (files.length === 0 && existingImages.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    setLoading(true);
    
    const data = new FormData();
    data.append('title', title);
    data.append('description', description);
    data.append('price', price);
    data.append('category', category);
    data.append('condition', condition);
    data.append('listingType', listingType);
    data.append('location', location);
    
    files.forEach(file => {
      data.append('images', file);
    });

    if (editListingId) {
      data.append('existingImages', JSON.stringify(existingImages));
    }

    try {
      if (editListingId) {
        const res = await axios.put(`/api/listings/${editListingId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Listing updated successfully!');
        navigate(`/item/${res.data._id}`);
      } else {
        const res = await axios.post('/api/listings', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Listing published successfully!');
        if (res.data?._id) {
          navigate(`/item/${res.data._id}`);
        } else {
          navigate('/marketplace');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing. Please try again.');
      setError(err.response?.data?.message || 'Failed to save listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Tickets', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const locations = [
    'Campus Library',
    'Administrative Block',
    'Canteen',
    'Near Volley Ball Court'
  ];

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Multi-Step Form Section */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <header>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {editListingId ? 'Edit Listing Details' : 'List a New Item'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Reach thousands of students on your campus in minutes.</p>
          </header>

          {!isProfileComplete(user) && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                <div>
                  <h4 className="font-bold text-sm">Profile Details Incomplete</h4>
                  <p className="text-xs opacity-90">You must fill out your Major, Graduation Year, and Bio before listing products for sale.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/profile/${user?._id}?edit=true`)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          )}

          {/* Stepper Progress */}
          <div className="flex items-center justify-between w-full max-w-md">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
            }`} id="step-dot-1">1</div>
            
            <div className="flex-grow h-1 bg-surface-container-highest mx-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: step >= 2 ? '100%' : '0%' }}></div>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
            }`} id="step-dot-2">2</div>
            
            <div className="flex-grow h-1 bg-surface-container-highest mx-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: step >= 3 ? '100%' : '0%' }}></div>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
            }`} id="step-dot-3">3</div>
          </div>

          {error && (
            <div className="p-sm bg-error-container/20 border border-error-container text-error rounded-xl text-xs flex gap-xs items-center leading-snug">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="relative min-h-[400px]">
            {/* Step 1: Photos */}
            {step === 1 && (
              <section className="step-transition show-step flex flex-col gap-6" id="step-1">
                <h2 className="font-headline-md text-headline-md">Upload Photos</h2>
                
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center gap-4 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface">Drag & drop or click to upload</p>
                    <p className="font-caption text-caption text-on-surface-variant">Supports JPG, PNG (Max 5 photos, under 2MB each)</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-surface-container-high flex items-center justify-center text-outline-variant relative overflow-hidden">
                      {previews[i] ? (
                        <>
                          <img src={previews[i]} alt={`upload-preview-${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center active:scale-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      ) : (
                        <span className="material-symbols-outlined">image</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next Step <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* Step 2: Item Details */}
            {step === 2 && (
              <section className="step-transition show-step flex flex-col gap-6" id="step-2">
                <h2 className="font-headline-md text-headline-md">Item Details</h2>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Listing Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-xl p-4 font-body-md text-body-md text-on-surface outline-none"
                    placeholder="e.g. Organic Chemistry Textbook (10th Ed)"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-xl p-4 font-body-md text-body-md text-on-surface outline-none"
                    >
                      {categories.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Condition</label>
                    <div className="flex gap-2 flex-wrap">
                      {conditions.map((cond, idx) => {
                        const isSelected = formData.condition === cond;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleConditionChange(cond)}
                            className={`px-4 py-2 rounded-full border border-outline-variant font-label-md text-label-md transition-all ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary'
                                : 'text-on-surface-variant hover:bg-primary/5 active:bg-primary'
                            }`}
                          >
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-xl p-4 font-body-md text-body-md text-on-surface outline-none resize-none"
                    placeholder="Describe the item's condition, features, or why you're selling..."
                    rows="4"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-8 py-3 border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next Step <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </section>
            )}

            {/* Step 3: Pricing and Location */}
            {step === 3 && (
              <section className="step-transition show-step flex flex-col gap-6" id="step-3">
                <h2 className="font-headline-md text-headline-md">Pricing & Location</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline-md text-headline-md text-on-surface-variant">₹</span>
                      <input
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-xl p-4 pl-10 font-headline-md text-headline-md text-tertiary outline-none"
                        placeholder="0.00"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Campus Pickup Point</label>
                    <div className="relative">
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-xl p-4 font-body-md text-body-md text-on-surface outline-none appearance-none pr-10"
                      >
                        {locations.map((loc, idx) => (
                          <option key={idx} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/70">
                        location_on
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-tertiary-container/10 rounded-xl flex gap-4 items-start border border-tertiary/10">
                  <span className="material-symbols-outlined text-tertiary">shield</span>
                  <div>
                    <p className="font-label-md text-label-md text-tertiary">Safe Transaction Promise</p>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">We recommend meeting in public, well-lit campus areas. CampusLoop verified sellers have a higher trust rating.</p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-8 py-3 border border-outline-variant text-on-surface-variant rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? 'Saving...' : (editListingId ? 'Save Changes' : 'Publish Listing')} 
                    <span className="material-symbols-outlined">rocket_launch</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Live Preview Card Section */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 mt-8 lg:mt-0">
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-label-md text-primary uppercase tracking-widest px-1">Live Preview</span>
            
            <div className="bg-surface rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-surface-variant/50 flex flex-col group hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-shadow duration-500 bg-surface-container-lowest">
              
              {/* Preview Image Area */}
              <div className="relative aspect-[4/3] bg-surface-container overflow-hidden">
                {previews[0] ? (
                  <img src={previews[0]} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline-variant bg-surface-container">
                    <span className="material-symbols-outlined text-[48px]">image</span>
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-caption font-label-md text-on-surface shadow-sm">
                    {formData.category}
                  </span>
                </div>
                
                <div className="absolute bottom-4 right-4">
                  <span className="bg-tertiary text-on-tertiary px-4 py-2 rounded-xl text-headline-md font-headline-md shadow-lg">
                    ₹{formData.price || '0.00'}
                  </span>
                </div>
              </div>

              {/* Preview Content Area */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-2">
                    {formData.title || 'Listing Title Preview'}
                  </h3>
                  <button type="button" className="p-2 text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-caption font-label-md">
                    {formData.condition}
                  </span>
                  <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-caption font-label-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{formData.location}</span>
                  </span>
                </div>

                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
                  {formData.description || 'The description you write will appear here, giving buyers more details about your item...'}
                </p>

                <div className="h-px bg-outline-variant/30 my-2"></div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary overflow-hidden border border-outline-variant">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined">person</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">
                      {user?.name || 'Alex Rivera'}
                    </span>
                    <span className="text-caption font-caption text-on-surface-variant">Verified Student</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      {/* Floating alert toast (file upload errors only) */}
      {fileToast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in flex items-center gap-xs bg-error-container text-error px-4 py-2.5 rounded-2xl shadow-xl border border-error-container/20">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span className="font-semibold text-xs">{fileToast.message}</span>
        </div>
      )}
    </main>
  );
};

export default CreateListing;
