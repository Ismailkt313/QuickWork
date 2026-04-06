import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile } from '../../auth/services/authApi';
import { toast } from 'react-hot-toast';
import {   RiSaveLine, RiUser3Line, RiPhoneLine } from 'react-icons/ri';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),

  number: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return /^[1-9][0-9]{9}$/.test(val)
      },
      {
        message: 'Enter a valid 10-digit phone number (cannot start with 0)',
      }
    ),
})

type ProfileFormData = z.infer<typeof profileSchema>;

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSuccess 
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      number: user?.number || '',
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        number: user.number || '',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateProfile(data);
      if (response.success) {
        toast.success('Profile updated successfully');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden animate-slide-up">
          <div className="modal-header border-0 bg-primary text-white p-4">
            <h5 className="modal-title fw-bold">Update Profile</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body p-4">
              <div className="mb-3 text-start">
                <label className="form-label small fw-bold text-secondary">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiUser3Line />
                  </span>
                  <input
                    {...register('name')}
                    type="text"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <div className="invalid-feedback d-block text-danger small mt-1">{errors.name.message}</div>}
                </div>
              </div>

              <div className="mb-1 text-start">
                <label className="form-label small fw-bold text-secondary">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-secondary">
                    <RiPhoneLine />
                  </span>
                  <input
                    {...register('number')}
                    type="text"
                    className={`form-control bg-light border-start-0 ps-0 ${errors.number ? 'is-invalid' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.number && <div className="invalid-feedback d-block text-danger small mt-1">{errors.number.message}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-light rounded-3 px-4 fw-bold flex-grow-1" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-3 px-4 fw-bold flex-grow-2"
                disabled={isSubmitting}
                style={{ minWidth: '140px' }}
              >
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <RiSaveLine className="me-1" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
