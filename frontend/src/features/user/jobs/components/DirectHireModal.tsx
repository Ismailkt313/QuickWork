import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiBriefcase,
    FiAlignLeft,
    FiGrid,
    FiClock,
    FiDollarSign,
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
import { LocationRepository } from '../../../../services/repositories/LocationRepository';
import { jobService } from '../services/job.service';
import type { JobFormData, Location } from '../types/job.types';
import { MIN_JOB_WAGE } from '../constants/jobConstants';

interface DirectHireModalProps {
    isOpen: boolean;
    onClose: () => void;
    providerId: string;
    providerName: string;
    providerSkills: { id?: string; _id?: string; name: string; }[];
}

export const DirectHireModal: React.FC<DirectHireModalProps> = ({
    isOpen,
    onClose,
    providerId,
    providerName,
    providerSkills
}) => {
    const navigate = useNavigate();
    const backdropRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        category: providerSkills.length > 0 ? (providerSkills[0].id || providerSkills[0]._id || '') : '',
        durationType: 'half_day',
        startDate: '',
        days: '',
        minBudget: '',
        maxBudget: '',
        freelancersNeeded: '1',
        location: '',
        address: '',
        isUrgent: false
    });

    const [locations, setLocations] = useState<Location[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locs = await LocationRepository.getLocations();
                setLocations(locs || []);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        if (isOpen) fetchLocations();
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
            [name]: name === 'isUrgent' ? (e.target as HTMLInputElement).checked : value,
            ...(name === 'durationType' && value !== 'multi_day' ? { days: '' } : {})
        }));
        if (errors[name as keyof JobFormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof JobFormData, string>> = {};
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        else if (formData.title.trim().length < 5) newErrors.title = 'Min 5 characters';
        
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.trim().length < 10) newErrors.description = 'Min 10 characters';

        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (formData.durationType === 'multi_day' && (!formData.days || Number(formData.days) < 1)) {
            newErrors.days = 'Days required';
        }
        if (!formData.minBudget || Number(formData.minBudget) < MIN_JOB_WAGE) {
            newErrors.minBudget = `Min budget must be ₹${MIN_JOB_WAGE}`;
        }
        if (!formData.maxBudget || Number(formData.maxBudget) <= 0) {
            newErrors.maxBudget = 'Enter max budget';
        } else if (Number(formData.maxBudget) < Number(formData.minBudget)) {
            newErrors.maxBudget = 'Max must be >= Min';
        }
        if (!formData.location) newErrors.location = 'Location required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            if (!formData.location || !formData.category || !providerId) {
                toast.error('Missing required information');
                return;
            }

            const result = await jobService.createJob({
                title: formData.title,
                description: formData.description,
                skillId: formData.category,
                locationId: formData.location,
                budget: {
                    min: Number(formData.minBudget),
                    max: Number(formData.maxBudget)
                },
                durationType: formData.durationType,
                startDate: formData.startDate,
                days: formData.durationType === 'multi_day' ? Number(formData.days) : undefined,
                freelancersNeeded: 1,
                visibility: 'private',
                hiredProviderId: providerId,
                isUrgent: formData.isUrgent
            });

            if (result.success) {
                onClose();
                navigate('/user/jobs');
                toast.success('Hire request sent successfully!');
            } else {
                toast.error(result.message || 'Failed to hire provider');
            }
        } catch (error) {
            console.error('Error hiring provider:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const skillOptions: SelectOption[] = providerSkills.map(s => ({ value: s.id || s._id || '', label: s.name }));
    const locationOptions: SelectOption[] = locations.map(l => ({ value: l.id, label: l.name }));
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
                    background: '#fff', borderRadius: 24, width: '100%', maxWidth: 640,
                    maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
                    animation: 'qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
                    margin: '20px',
                }}
            >
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                            <FiZap />
                        </div>
                        <div>
                            <h5 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Direct Hire</h5>
                            <p style={{ margin: '2px 0 0', fontSize: 14, color: '#64748b' }}>Hiring <span style={{ color: '#2563eb', fontWeight: 600 }}>{providerName}</span> for a project</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                        <FiX />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-12">
                                <FormInput label="Project Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} placeholder="What needs to be done?" icon={<FiBriefcase />} required />
                            </div>
                            <div className="col-12">
                                <FormTextarea label="Tell us more about the job" name="description" value={formData.description} onChange={handleChange} error={errors.description} placeholder="Describe the tasks, expectations, and deliverables..." rows={4} icon={<FiAlignLeft />} required />
                            </div>
                            <div className="col-md-6">
                                <FormSelect label="Service Category" name="category" value={formData.category} onChange={handleChange} error={errors.category} options={skillOptions} icon={<FiGrid />} required />
                            </div>
                            <div className="col-md-6">
                                <FormSelect label="Work Location" name="location" value={formData.location} onChange={handleChange} error={errors.location} options={locationOptions} placeholder="Select location" icon={<FiMap />} required />
                            </div>
                            <div className="col-md-6">
                                <FormSelect label="Estimated Duration" name="durationType" value={formData.durationType} onChange={handleChange} options={durationOptions} icon={<FiClock />} />
                            </div>
                            <div className="col-md-6">
                                <FormInput label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} error={errors.startDate} min={new Date().toISOString().split('T')[0]} icon={<FiCalendar />} required />
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
                            <div className="col-12 mt-2">
                                <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: formData.isUrgent ? '#fff1f2' : '#f8fafc', border: `1px solid ${formData.isUrgent ? '#fecdd3' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                                    <input type="checkbox" id="isUrgent" name="isUrgent" checked={formData.isUrgent} onChange={handleChange} style={{ width: 20, height: 20, cursor: 'pointer' }} />
                                    <label htmlFor="isUrgent" style={{ flex: 1, margin: 0, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: formData.isUrgent ? '#e11d48' : '#475569' }}>
                                        Mark as Urgent Project
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16 }}>
                            <button type="button" onClick={onClose} className="btn py-3 px-4 flex-fill" style={{ borderRadius: 14, background: '#f8fafc', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn py-3 px-4 flex-fill" style={{ borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 700, border: 'none', boxShadow: '0 8px 20px rgba(59,130,246,0.25)', transition: 'all 0.2s' }}>
                                {isSubmitting ? 'Sending Request...' : 'Send Hire Request'}
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
