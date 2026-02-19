import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Api from "../services/api";

import editIcon from "@assets/editIco.svg";
import profileIcon from "@assets/proPic.svg";
import searchIcon from "@assets/search.svg";
import toggleIcon from "@assets/toggle.svg";
import toggleOnIcon from "@assets/toggleOn.svg";
import notiIcon from "@assets/notification.svg";
import dropdownIcon from "@assets/dropdown.svg";
import deleteIcon from "@assets/delete.svg";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= FETCH USERS =================
  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("company_id");

        const res = await Api.get("api/user", {
         
            Authorization: `Bearer ${token}`,
            "company-id": companyId,
            Accept: "application/json",
        
        });

        setUsers(res.data?.data || []);
      } catch (err) {
        console.log("FETCH ERROR:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (user) => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("company_id");

    // optimistic update
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, status: !u.status } : u
    );
    setUsers(updatedUsers);

    try {
      await Api.put(
        `api/user/${user.id}`,
        { status: !user.status },
        {
         
            Authorization: `Bearer ${token}`,
            "company-id": companyId,
            Accept: "application/json",
         
        }
      );

      toast.success("Status updated successfully");
    } catch {
      // revert if failed
      const revertedUsers = users.map((u) =>
        u.id === user.id ? { ...u, status: user.status } : u
      );
      setUsers(revertedUsers);

      toast.error("Failed to update status");
    }
  };

  // ================= DELETE USER =================
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");

      await Api.delete(`api/user/${deleteId}`, {
      
          Authorization: `Bearer ${token}`,
          "company-id": companyId,
          Accept: "application/json",
        
      });

      setUsers(users.filter((u) => u.id !== deleteId));
      toast.success("User deleted successfully");
      setDeleteId(null);
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // ================= SEARCH + FILTER =================
  const filtered = users
    .filter((u) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`;
      return (
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((u) =>
      statusFilter === ""
        ? true
        : u.status === (statusFilter === "Active")
    );

  // ================= PAGINATION =================
  const perPage = 10;
  const pages = Math.ceil(filtered.length / perPage);

  const displayed = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // ================= UI =================
  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#1F2937]">
          User Management
        </h1>

        <div className="flex items-center gap-4">
          <img src={notiIcon} alt="" className="w-8 h-8" />
          <img src={profileIcon} alt="" className="w-8 h-8" />
        </div>
      </div>

      {/* SEARCH + FILTER + ADD */}
      <div className="flex justify-between mb-5">
        <div className="flex gap-4">
          {/* SEARCH */}
          <div className="relative w-72">
            <img
              src={searchIcon}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
            />
            <input
              placeholder="Search by name, email.."
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-[#F9FAFB] text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative w-44">
            <select
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border bg-[#F9FAFB] text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <img
              src={dropdownIcon}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 opacity-60 pointer-events-none"
            />
          </div>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => navigate("/users/add")}
          className="bg-[#6C5DD3] hover:bg-[#5a4ec4] text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          + Add New User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4B3F72] text-white">
            <tr>
              <th className="px-4 py-3 text-left">S.L</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Initials</th>
              <th className="px-4 py-3 text-left">Phone Number</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8">
                  No users found
                </td>
              </tr>
            ) : (
              displayed.map((u, i) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    {(currentPage - 1) * perPage + i + 1}
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {u.first_name} {u.last_name}
                  </td>

                  <td className="px-4 py-4">{u.email}</td>
                  <td className="px-4 py-4">{u.initials || "-"}</td>
                  <td className="px-4 py-4">{u.phone || "-"}</td>
                  <td className="px-4 py-4">{u.role?.title || "-"}</td>

                  <td className="px-4 py-4">
                    <img
                      src={u.status ? toggleOnIcon : toggleIcon}
                      className="w-10 cursor-pointer"
                      onClick={() => handleToggleStatus(u)}
                    />
                  </td>

                  <td className="px-4 py-4">{u.title || "-"}</td>

                  <td className="px-4 py-4 flex justify-center gap-4">
                    <img
                      src={editIcon}
                      onClick={() =>
                        navigate(`/users/edit/${u.id}`)
                      }
                      className="w-5 cursor-pointer"
                    />

                    <img
                      src={deleteIcon}
                      onClick={() => setDeleteId(u.id)}
                      className="w-5 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="flex justify-end gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded border text-sm ${
                currentPage === i + 1
                  ? "bg-[#6C5DD3] text-white border-[#6C5DD3]"
                  : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </DashboardLayout>
  );
}
