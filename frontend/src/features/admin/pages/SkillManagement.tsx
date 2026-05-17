import React, { useEffect, useState, useCallback } from "react";
import { adminSkillService, type Skill } from "../services/adminSkill.service";
import { 
    RiBriefcaseLine, 
    RiPencilLine, 
    RiDeleteBinLine, 
    RiToggleLine
} from "react-icons/ri";
import { toast } from "react-toastify";
import useDebounce from "../../../hooks/useDebounce";
import { AdminPageHeader, AdminFilterBar, DataTable, type Column } from "../components/table";
import { CustomSelect } from "../../../shared/components/ui/CustomSelect";
import "../admin.css";

const SkillManagement: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebounce(searchInput, 500);
    const [statusFilter, setStatusFilter] = useState("");
    const [lastSearch, setLastSearch] = useState("");
    const [lastStatus, setLastStatus] = useState("");
    const limit = 10;

    if (debouncedSearch !== lastSearch || statusFilter !== lastStatus) {
        setLastSearch(debouncedSearch);
        setLastStatus(statusFilter);
        setPage(1);
    }

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<Partial<Skill> | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchSkills = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminSkillService.getSkills(page, limit, debouncedSearch, statusFilter);
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
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);



    const handleToggleStatus = async (id: string) => {
        try {
            const response = await adminSkillService.toggleStatus(id);
            if (response.success) {
                toast.success(response.message);
                setSkills(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, isActive: !s.isActive } : s));
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
            const skillId = currentSkill._id || currentSkill.id;
            if (skillId) {
                response = await adminSkillService.updateSkill(skillId, currentSkill);
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
        const skillId = currentSkill?._id || currentSkill?.id;
        if (!skillId) return;

        try {
            setModalLoading(true);
            const response = await adminSkillService.deleteSkill(skillId);
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

    const columns: Column<Skill>[] = [
        {
            key: "name",
            header: "Skill Name",
            render: (skill) => (
                <div className="d-flex align-items-center gap-3">
                    <div style={{ backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "8px", padding: "8px" }}>
                        <RiBriefcaseLine size={18} />
                    </div>
                    <div>
                        <div className="fw-bold text-slate-800">{skill.name}</div>
                        <div className="text-xs font-monospace" style={{ fontSize: "11px", color: "#94a3b8" }}>slug: {skill.slug}</div>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (skill) => (
                <span className={`badge rounded-pill ${skill.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                    {skill.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (skill) => (
                <div className="small" style={{ color: "#64748b" }}>
                    {new Date(skill.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "center",
            render: (skill) => (
                <div className="d-flex justify-content-center gap-2">
                    <button 
                        className={`btn btn-sm ${skill.isActive ? 'text-warning' : 'text-success'}`}
                        onClick={() => handleToggleStatus(skill._id || skill.id!)}
                        title={skill.isActive ? "Deactivate" : "Activate"}
                        style={{ padding: "4px 8px", background: "none", border: "none" }}
                    >
                        <RiToggleLine size={18} />
                    </button>
                    <button 
                        className="btn btn-sm text-primary"
                        onClick={() => {
                            setCurrentSkill(skill);
                            setIsEditModalOpen(true);
                        }}
                        title="Edit"
                        style={{ padding: "4px 8px", background: "none", border: "none" }}
                    >
                        <RiPencilLine size={18} />
                    </button>
                    <button 
                        className="btn btn-sm text-danger"
                        onClick={() => {
                            setCurrentSkill(skill);
                            setIsDeleteModalOpen(true);
                        }}
                        title="Delete"
                        style={{ padding: "4px 8px", background: "none", border: "none" }}
                    >
                        <RiDeleteBinLine size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page-container">
            <AdminPageHeader
                title="Global Skill Directory"
                subtitle="Manage the master list of services and skills available on the platform."
                breadcrumb={<>Admin <span className="separator">›</span> <span>Global Skill Directory</span></>}
                actionButton={{
                    label: "Add New Skill",
                    icon: "bi bi-plus-lg",
                    onClick: () => {
                        setCurrentSkill({ name: "", isActive: true });
                        setIsEditModalOpen(true);
                    }
                }}
            />

            <AdminFilterBar
                searchPlaceholder="Search by skill name or description..."
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onReset={() => {
                    setSearchInput("");
                    setStatusFilter("");
                    setPage(1);
                }}
            >
                <CustomSelect
                    value={statusFilter}
                    onChange={(v) => { setStatusFilter(v); setPage(1); }}
                    options={[
                        { value: "", label: "All Statuses" },
                        { value: "active", label: "Active Only" },
                        { value: "inactive", label: "Inactive Only" }
                    ]}
                    size="sm"
                    className="admin-filter-select-override"
                />
            </AdminFilterBar>

            <DataTable
                columns={columns}
                data={skills}
                loading={loading}
                emptyMessage="No skills found. Start by adding a new one."
                emptyIcon="bi bi-briefcase"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                keyExtractor={(skill) => skill._id || skill.id || Math.random().toString()}
            />

            {/* Edit/Create Modal */}
            {isEditModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal-card" style={{ maxWidth: '500px' }}>
                        <div className="confirm-modal-title">
                            {(currentSkill?._id || currentSkill?.id) ? "Edit Skill" : "Add New Skill"}
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
