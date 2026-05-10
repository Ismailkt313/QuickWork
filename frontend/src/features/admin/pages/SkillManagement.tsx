import React, { useEffect, useState, useCallback } from "react";
import { adminSkillService, type Skill } from "../services/adminSkill.service";
import { 
    RiBriefcaseLine, 
    RiAddLine, 
    RiSearchLine, 
    RiPencilLine, 
    RiDeleteBinLine, 
    RiToggleLine,
    RiArrowLeftSLine,
    RiArrowRightSLine
} from "react-icons/ri";
import { toast } from "react-toastify";
import "../admin.css";

const SkillManagement: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const limit = 10;

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<Partial<Skill> | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchSkills = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminSkillService.getSkills(page, limit, search);
            if (response.success) {
                setSkills(response.data);
                setTotalPages(response.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch skills", error);
            toast.error("Failed to load skills directory");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const response = await adminSkillService.toggleStatus(id);
            if (response.success) {
                toast.success(response.message);
                setSkills(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
            }
        } catch {
            toast.error("Failed to update skill status");
        }
    };

    const handleSaveSkill = async () => {
        if (!currentSkill?.name) {
            toast.error("Skill name is required");
            return;
        }

        try {
            setModalLoading(true);
            let response;
            if (currentSkill._id) {
                response = await adminSkillService.updateSkill(currentSkill._id, currentSkill);
            } else {
                response = await adminSkillService.createSkill(currentSkill);
            }

            if (response.success) {
                toast.success(response.message);
                setIsEditModalOpen(false);
                fetchSkills();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error("Failed to save skill");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteSkill = async () => {
        if (!currentSkill?._id) return;

        try {
            setModalLoading(true);
            const response = await adminSkillService.deleteSkill(currentSkill._id);
            if (response.success) {
                toast.success(response.message);
                setIsDeleteModalOpen(false);
                fetchSkills();
            }
        } catch {
            toast.error("Failed to delete skill");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            {/* Breadcrumb */}
            <div className="admin-breadcrumb">
                Admin <span className="separator">›</span> <span>Global Skill Directory</span>
            </div>

            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Global Skill Directory</h1>
                    <p className="admin-page-subtitle">
                        Manage the master list of services and skills available on the platform.
                    </p>
                </div>
                <button 
                    className="btn btn-invite"
                    onClick={() => {
                        setCurrentSkill({ name: "", isActive: true });
                        setIsEditModalOpen(true);
                    }}
                >
                    <RiAddLine className="me-2" />
                    Add New Skill
                </button>
            </div>

            {/* Filter Bar */}
            <form className="admin-filter-bar" onSubmit={handleSearch}>
                <RiSearchLine className="admin-search-icon" />
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by skill name or description..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm px-4 rounded-3">Search</button>
            </form>

            {/* Table */}
            <div className="admin-table-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Skill Name</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="opacity-50">
                                    <td colSpan={4} className="py-4 text-center">
                                        <div className="placeholder-glow">
                                            <span className="placeholder col-12"></span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : skills.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-slate-400">
                                    No skills found. Start by adding a new one.
                                </td>
                            </tr>
                        ) : (
                            skills.map((skill) => (
                                <tr key={skill._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                                <RiBriefcaseLine size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-slate-800">{skill.name}</div>
                                                <div className="text-xs text-slate-400 font-monospace">slug: {skill.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill ${skill.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-slate-100 text-slate-500'}`}>
                                            {skill.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-slate-500 small">
                                            {new Date(skill.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button 
                                                className={`btn btn-sm ${skill.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                onClick={() => handleToggleStatus(skill._id)}
                                                title={skill.isActive ? "Deactivate" : "Activate"}
                                            >
                                                <RiToggleLine size={18} />
                                            </button>
                                            <button 
                                                className="btn btn-sm text-blue-600 hover:bg-blue-50"
                                                onClick={() => {
                                                    setCurrentSkill(skill);
                                                    setIsEditModalOpen(true);
                                                }}
                                                title="Edit"
                                            >
                                                <RiPencilLine size={18} />
                                            </button>
                                            <button 
                                                className="btn btn-sm text-rose-600 hover:bg-rose-50"
                                                onClick={() => {
                                                    setCurrentSkill(skill);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                title="Delete"
                                            >
                                                <RiDeleteBinLine size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="admin-table-footer">
                    <div className="admin-pagination">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                            <RiArrowLeftSLine />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={p === page ? "active" : ""}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                            <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit/Create Modal */}
            {isEditModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-card" style={{ maxWidth: '500px' }}>
                        <div className="confirm-modal-title">
                            {currentSkill?._id ? "Edit Skill" : "Add New Skill"}
                        </div>
                        <div className="p-4 pt-0">
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-slate-500 uppercase">Skill Name</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3"
                                    value={currentSkill?.name || ""}
                                    onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Graphic Design"
                                />
                            </div>
                        </div>
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-btn cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="confirm-modal-btn confirm-approve" onClick={handleSaveSkill} disabled={modalLoading}>
                                {modalLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-card">
                        <div className="confirm-modal-icon reject">
                            <RiDeleteBinLine size={32} />
                        </div>
                        <div className="confirm-modal-title text-danger">Delete Skill</div>
                        <div className="confirm-modal-message">
                            Are you sure you want to delete <strong>"{currentSkill?.name}"</strong>? 
                            This action cannot be undone and may affect providers currently offering this skill.
                        </div>
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-btn cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="confirm-modal-btn confirm-reject" onClick={handleDeleteSkill} disabled={modalLoading}>
                                {modalLoading ? "Deleting..." : "Yes, Delete Skill"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillManagement;
