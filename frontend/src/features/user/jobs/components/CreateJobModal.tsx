import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    FiBriefcase,
    FiAlignLeft,
    FiGrid,
    FiClock,
    FiDollarSign,
    FiUsers,
    FiMap,
    FiCalendar,
    FiHash,
    FiX,
    FiZap
} from 'react-icons/fi';
import { FormInput } from '../../../../shared/components/inputs/FormInput';
import { FormTextarea } from '../../../../shared/components/inputs/FormTextarea';
import { FormSelect } from '../../../../shared/components/inputs/FormSelect';
import type { SelectOption } from '../../../../shared/components/inputs/FormSelect';
import { CategoryRepository } from '../../../../services/repositories/CategoryRepository';
import { LocationRepository } from '../../../../services/repositories/LocationRepository';
import { jobService } from '../services/job.service';
import type { JobFormData, ServiceCategory, Location } from '../types/job.types';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
    isOpen,
    onClose
}) => {
    const navigate = useNavigate();
    const backdropRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        category: '',
        durationType: 'half_day',
        startDate: '',
        days: '',
        minBudget: '',
        maxBudget: '',
        freelancersNeeded: '1',
        location: '',
        address: ''
    });

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, locs] = await Promise.all([
                    CategoryRepository.getCategories(),
                    LocationRepository.getLocations()
                ]);
                setCategories(cats || []);
                setLocations(locs || []);
            } catch (error) {
                console.error('Error fetching categories/locations:', error);
            }
        };
        if (isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            ...(name === 'durationType' && value !== 'multi_day' ? { startDate: '', days: '' } : {})
        }));
        if (errors[name as keyof JobFormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof JobFormData, string>> = {};
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 10) newErrors.description = 'Please provide at least 10 characters';

        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        
        if (formData.durationType === 'multi_day' && (!formData.days || Number(formData.days) < 1)) {
            newErrors.days = 'Days must be at least 1';
        }
        
        if (!formData.minBudget || Number(formData.minBudget) <= 0) newErrors.minBudget = 'Enter min budget';
        if (!formData.maxBudget || Number(formData.maxBudget) <= 0) newErrors.maxBudget = 'Enter max budget';
        if (Number(formData.maxBudget) < Number(formData.minBudget)) {
            newErrors.maxBudget = 'Max must be >= Min';
        }

        if (!formData.freelancersNeeded || Number(formData.freelancersNeeded) < 1) {
            newErrors.freelancersNeeded = 'At least 1 freelancer is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const selectedCategory = categories.find(c => c.name === formData.category);
            const selectedLocation = locations.find(l => l.name === formData.location);

            if (!selectedCategory || !selectedLocation) {
                toast.error('Invalid selection');
                return;
            }

            const result = await jobService.createJob({
                title: formData.title,
                description: formData.description,
                skillId: selectedCategory._id || selectedCategory.id,
                locationId: selectedLocation.id,
                budget: {
                    min: Number(formData.minBudget),
                    max: Number(formData.maxBudget)
                },
                durationType: formData.durationType,
                startDate: formData.startDate,
                days: formData.durationType === 'multi_day' ? Number(formData.days) : undefined,
                freelancersNeeded: Number(formData.freelancersNeeded),
                visibility: 'public'
            });

            if (result.success) {
                onClose();
                navigate('/user/jobs');
                toast.success('Job posted successfully!');
            } else {
                toast.error(result.message || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryOptions: SelectOption[] = categories.map(c => ({ value: c.name, label: c.name }));
    const locationOptions: SelectOption[] = locations.map(l => ({ value: l.name, label: l.name }));
    const durationOptions = [
        { label: "Half Day (~4 hrs)", value: "half_day" },
        { label: "Full Day (8 hrs)", value: "full_day" },
        { label: "Multiple Days", value: "multi_day" },
    ];

    return (
        <div
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'qwFadeIn 0.2s ease',
            }}
        >
            <div
                style={{
                    background: '#fff', borderRadius: 24, width: '100%', maxWidth: 720,
                    maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
                    animation: 'qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
                    margin: '20px',
                }}
            >
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                            <FiZap />
                        </div>
                        <div>
                            <h5 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Post a New Job</h5>
                            <p style={{ margin: '2px 0 0', fontSize: 14, color: '#64748b' }}>Connect with skilled providers instantly</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                        <FiX />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-12">
                                <FormInput label="Job Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} placeholder="e.g. Build a responsive website" icon={<FiBriefcase />} required />
                            </div>
                            <div className="col-12">
                                <FormTextarea label="Job Description" name="description" value={formData.description} onChange={handleChange} error={errors.description} placeholder="Describe the tasks, expectations, and deliverables..." rows={4} icon={<FiAlignLeft />} required />
                            </div>
                            <div className="col-md-6">
                                <FormSelect label="Service Category" name="category" value={formData.category} onChange={handleChange} error={errors.category} options={categoryOptions} placeholder="Select a category" icon={<FiGrid />} required />
                            </div>
                            <div className="col-md-6">
                                <FormSelect label="Work Location" name="location" value={formData.location} onChange={handleChange} error={errors.location} options={locationOptions} placeholder="Select location" icon={<FiMap />} required />
                            </div>
                            <div className="col-md-4">
                                <FormSelect label="Estimated Duration" name="durationType" value={formData.durationType} onChange={handleChange} options={durationOptions} icon={<FiClock />} />
                            </div>
                            <div className="col-md-4">
                                <FormInput label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} error={errors.startDate} min={new Date().toISOString().split('T')[0]} icon={<FiCalendar />} required />
                            </div>
                            <div className="col-md-4">
                                <FormInput label="Freelancers Required" name="freelancersNeeded" type="number" value={formData.freelancersNeeded} onChange={handleChange} error={errors.freelancersNeeded} placeholder="1" icon={<FiUsers />} required />
                            </div>
                            {formData.durationType === 'multi_day' && (
                                <div className="col-12">
                                    <FormInput label="Number of Days" name="days" type="number" value={formData.days} onChange={handleChange} error={errors.days} placeholder="e.g. 5" icon={<FiHash />} required />
                                </div>
                            )}
                            <div className="col-md-6">
                                <FormInput label="Min Budget (₹)" name="minBudget" type="number" value={formData.minBudget} onChange={handleChange} error={errors.minBudget} placeholder="0" icon={<FiDollarSign />} required />
                            </div>
                            <div className="col-md-6">
                                <FormInput label="Max Budget (₹)" name="maxBudget" type="number" value={formData.maxBudget} onChange={handleChange} error={errors.maxBudget} placeholder="0" icon={<FiDollarSign />} required />
                            </div>
                        </div>

                        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16 }}>
                            <button type="button" onClick={onClose} className="btn py-3 px-4 flex-fill" style={{ borderRadius: 14, background: '#f8fafc', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn py-3 px-4 flex-fill" style={{ borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 700, border: 'none', boxShadow: '0 8px 20px rgba(59,130,246,0.25)', transition: 'all 0.2s' }}>
                                {isSubmitting ? 'Posting...' : 'Post Job Now'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}} />
        </div>
    );
};
