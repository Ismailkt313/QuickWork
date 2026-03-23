import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBriefcase,
    FiAlignLeft,
    FiGrid,
    FiAward,
    FiClock,
    FiDollarSign,
    FiUsers,
    FiMapPin,
    FiMap
} from 'react-icons/fi';
import { FormInput } from '../../../../shared/components/inputs/FormInput';
import { FormTextarea } from '../../../../shared/components/inputs/FormTextarea';
import { FormSelect } from '../../../../shared/components/inputs/FormSelect';
import type { SelectOption } from '../../../../shared/components/inputs/FormSelect';
import { SectionCard } from '../../../../shared/components/layout/SectionCard';
import type { JobFormData, ServiceCategory, Location } from '../types/job.types';
import { CategoryRepository } from '../../../../services/repositories/CategoryRepository';
import { LocationRepository } from '../../../../services/repositories/LocationRepository';
import { jobService } from '../services/job.service';

export const CreateJobForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        category: '',
        experience: 'Intermediate',
        duration: '',
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
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as string }));

        if (errors[name as keyof JobFormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof JobFormData, string>> = {};

        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';

        if (!formData.description.trim()) newErrors.description = 'Job description is required';
        else if (formData.description.length < 10) newErrors.description = 'Please provide at least 10 characters of description';

        if (!formData.category) newErrors.category = 'Please select a service category';
        if (!formData.experience) newErrors.experience = 'Please select required experience level';

        if (!formData.duration || Number(formData.duration) <= 0) newErrors.duration = 'Please enter a valid estimated duration';
        
        if (!formData.minBudget || Number(formData.minBudget) <= 0) newErrors.minBudget = 'Enter min budget';
        if (!formData.maxBudget || Number(formData.maxBudget) <= 0) newErrors.maxBudget = 'Enter max budget';
        if (Number(formData.maxBudget) < Number(formData.minBudget)) {
            newErrors.maxBudget = 'Max budget must be >= min budget';
        }

        if (!formData.freelancersNeeded || Number(formData.freelancersNeeded) < 1) newErrors.freelancersNeeded = 'At least 1 freelancer is required';

        if (!formData.location) newErrors.location = 'Please select a location requirement';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);
            try {
                const selectedCategory = categories.find(c => c.name === formData.category);
                const selectedLocation = locations.find(l => l.name === formData.location);

                if (!selectedCategory || !selectedLocation) {
                    setErrors(prev => ({
                        ...prev,
                        category: !selectedCategory ? 'Invalid category' : '',
                        location: !selectedLocation ? 'Invalid location' : ''
                    }));
                    setIsSubmitting(false);
                    return;
                }

                const result = await jobService.createJob({
                    title: formData.title,
                    description: formData.description,
                    experience: formData.experience,
                    duration: Number(formData.duration),
                    freelancersNeeded: Number(formData.freelancersNeeded),
                    skillId: selectedCategory._id || selectedCategory.id,
                    locationId: selectedLocation.id,
                    budget: {
                        min: Number(formData.minBudget),
                        max: Number(formData.maxBudget)
                    }
                });

                if (result.success) {
                    navigate('/');
                } else {
                    alert(result.message || 'Failed to post job. Please try again.');
                }
            } catch (error) {
                console.error('Error post job:', error);
                alert('An unexpected error occurred. Please try again later.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const experienceOptions: SelectOption[] = [
        { value: 'Beginner', label: 'Beginner ($)' },
        { value: 'Intermediate', label: 'Intermediate ($$)' },
        { value: 'Expert', label: 'Expert ($$$)' }
    ];

    const categoryOptions: SelectOption[] = categories.map(c => ({
        value: c.name,
        label: c.name
    }));

    const locationOptions: SelectOption[] = locations.map(l => ({
        value: l.name,
        label: l.name
    }));

    return (
        <div className="card border-0 mb-5" style={{ borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
            <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit} noValidate>
                    <SectionCard stepNumber={1} title="Job Details">
                        <FormInput
                            label="Job Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            error={errors.title}
                            required
                            placeholder="e.g. Build a responsive React website"
                            icon={<FiBriefcase size={18} />}
                        />

                        <FormTextarea
                            label="Job Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            error={errors.description}
                            required
                            placeholder="Describe the tasks, deliverables, and any special requirements..."
                            rows={6}
                            maxLength={5000}
                            icon={<FiAlignLeft size={18} />}
                        />

                        <FormSelect
                            label="Service Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            error={errors.category}
                            required
                            options={categoryOptions}
                            placeholder="Select a category"
                            icon={<FiGrid size={18} />}
                        />
                    </SectionCard>

                    <SectionCard stepNumber={2} title="Requirements">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <FormSelect
                                    label="Required Experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    error={errors.experience}
                                    required
                                    options={experienceOptions}
                                    placeholder="Select level"
                                    icon={<FiAward size={18} />}
                                />
                            </div>
                            <div className="col-md-6">
                                <FormInput
                                    label="Estimated Duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    error={errors.duration}
                                    required
                                    placeholder="e.g. 10"
                                    icon={<FiClock size={18} />}
                                    suffix="hours"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard stepNumber={3} title="Budget & Hiring">
                        <div className="row g-4">
                            <div className="col-md-3">
                                <FormInput
                                    label="Min Budget"
                                    name="minBudget"
                                    type="number"
                                    min="1"
                                    value={formData.minBudget}
                                    onChange={handleChange}
                                    error={errors.minBudget}
                                    required
                                    placeholder="Min"
                                    icon={<FiDollarSign size={18} />}
                                />
                            </div>
                            <div className="col-md-3">
                                <FormInput
                                    label="Max Budget"
                                    name="maxBudget"
                                    type="number"
                                    min="1"
                                    value={formData.maxBudget}
                                    onChange={handleChange}
                                    error={errors.maxBudget}
                                    required
                                    placeholder="Max"
                                    icon={<FiDollarSign size={18} />}
                                />
                            </div>
                            <div className="col-md-6">
                                <FormInput
                                    label="Freelancers Needed"
                                    name="freelancersNeeded"
                                    type="number"
                                    min="1"
                                    value={formData.freelancersNeeded}
                                    onChange={handleChange}
                                    error={errors.freelancersNeeded}
                                    required
                                    placeholder="e.g. 1"
                                    icon={<FiUsers size={18} />}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard stepNumber={4} title="Location">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <FormSelect
                                    label="Location Requirements"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    error={errors.location}
                                    required
                                    options={locationOptions}
                                    placeholder="Select region"
                                    icon={<FiMap size={18} />}
                                />
                            </div>
                            <div className="col-md-6">
                                <FormInput
                                    label="Specific Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="e.g. 123 Main St"
                                    icon={<FiMapPin size={18} />}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    <div className="d-flex justify-content-end gap-3 pt-3 mt-4 border-top">
                        <button
                            type="button"
                            className="btn btn-light px-4 py-2 fw-semibold shadow-none"
                            style={{ borderRadius: '8px', color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary px-5 py-2 fw-bold text-white shadow-sm"
                            disabled={isSubmitting}
                            style={{
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                border: 'none',
                                letterSpacing: '0.02em',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
