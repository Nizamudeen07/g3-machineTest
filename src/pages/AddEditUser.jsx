import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { FiTrash2, FiUpload } from "react-icons/fi";
import Api from "../services/api";

export default function AddEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    initials: "",
    role: "",
    responsibilities: [],
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewObjectUrlRef = useRef(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [responsibilityOptions, setResponsibilityOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");
      const formData = new FormData();
      formData.append("id", "");
      formData.append("type", "0");

      const res = await Api.post("role/dropdown", formData, {
        Authorization: `Bearer ${token}`,
        company_id: companyId,
        Accept: "application/json",
      });

      const roleData = res.data?.data || {};
      const dropdownRoles = Array.isArray(roleData.other_roles)
        ? roleData.other_roles
        : [];
      const combinedRoles = [
        roleData.owner ? { id: roleData.owner, title: "Owner" } : null,
        roleData.admin ? { id: roleData.admin, title: "Admin" } : null,
        ...dropdownRoles,
      ].filter(Boolean);

      setRoleOptions(combinedRoles);
    } catch (err) {
      console.log("FETCH ROLES ERROR:", err.response?.data || err);
      setRoleOptions([]);
    }
  }, []);

  const fetchResponsibilities = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");
      const res = await Api.get("user/dropdown-responsibility", {
        Authorization: `Bearer ${token}`,
        company_id: companyId,
        Accept: "application/json",
      });

      const options = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setResponsibilityOptions(options);
    } catch (err) {
      console.log("FETCH RESPONSIBILITIES ERROR:", err.response?.data || err);
      setResponsibilityOptions([]);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");

      const res = await Api.get(`user/${id}`, {
        Authorization: `Bearer ${token}`,
        company_id: companyId,
        Accept: "application/json",
      });

      const data = res.data?.data;
      if (!data) return;

      const roleValue = String(data.role?.id || data.role_type || data.role || "");
      const responsibilityValues = Array.isArray(data.responsibilities)
        ? data.responsibilities
            .map((item) =>
              String(
                typeof item === "object"
                  ? item?.id || item?.responsibility_id || ""
                  : item
              )
            )
            .filter(Boolean)
        : [];

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }

      setForm({
        name: data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email || "",
        phone: data.phone || "",
        title: data.title || "",
        initials: data.initials || "",
        role: roleValue,
        responsibilities: responsibilityValues,
      });

      setPreview(data.user_picture_url || null);
    } catch (err) {
      console.log("FETCH USER ERROR:", err.response?.data || err);
      toast.error("Failed to load user data");
    }
  }, [id]);

  useEffect(() => {
    fetchRoles();
    fetchResponsibilities();
  }, [fetchRoles, fetchResponsibilities]);

  useEffect(() => {
    if (isEdit && id) {
      fetchUser();
    }
  }, [fetchUser, id, isEdit]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const validate = () => {
    const err = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const normalizedPhone = trimmedPhone.replace(/[^\d]/g, "");
    const trimmedTitle = form.title.trim();
    const trimmedInitials = form.initials.trim().toUpperCase();

    if (!trimmedName) err.name = "Name is required.";
    if (!trimmedEmail) err.email = "Email is required.";
    if (trimmedEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)) {
      err.email = "Please enter a valid email address.";
    }
    if (!trimmedPhone) err.phone = "Phone number is required.";
    if (trimmedPhone && !/^\d{10,15}$/.test(normalizedPhone)) {
      err.phone = "Phone number must contain 10-15 digits.";
    }
    if (!trimmedTitle) err.title = "Title is required.";
    if (!trimmedInitials) err.initials = "Initials are required.";
    if (trimmedInitials && !/^[A-Z]{2,5}$/.test(trimmedInitials)) {
      err.initials = "Initials must be 2-5 uppercase letters.";
    }
    if (!form.role) err.role = "Role is required.";

    if (image) {
      const maxSize = 2 * 1024 * 1024;
      if (!image.type.startsWith("image/")) {
        err.image = "Profile image must be a valid image file.";
      } else if (image.size > maxSize) {
        err.image = "Profile image size must be less than 2MB.";
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    previewObjectUrlRef.current = URL.createObjectURL(file);

    setErrors((prev) => ({ ...prev, image: "" }));
    setImage(file);
    setPreview(previewObjectUrlRef.current);
  };

  const removeImage = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setImage(null);
    setPreview(null);
  };

  const toggleResponsibility = (value) => {
    setForm((prev) => {
      const nextResponsibilities = prev.responsibilities.includes(value)
        ? prev.responsibilities.filter((r) => r !== value)
        : [...prev.responsibilities, value];

      return {
        ...prev,
        responsibilities: nextResponsibilities,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("company_id");
      const requestConfig = {
        Authorization: `Bearer ${token}`,
        company_id: companyId,
        Accept: "application/json",
      };

      const payload = {
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title.trim(),
        initials: form.initials.trim().toUpperCase(),
        phone: form.phone.trim().replace(/[^\d]/g, ""),
        responsibilities: form.responsibilities,
      };

      const responsibilityIds = payload.responsibilities.map((value) => {
        const asNumber = Number(value);
        return Number.isNaN(asNumber) ? value : asNumber;
      });

      const formData = new FormData();
      formData.append("role", payload.role);
      formData.append("name", payload.name);
      formData.append("email", payload.email);
      formData.append("title", payload.title);
      formData.append("initials", payload.initials);
      formData.append("phone", payload.phone);
      formData.append("responsibilities", JSON.stringify(responsibilityIds));

      if (!isEdit) {
        formData.append("overwite_data", "1");
      } else {
        formData.append("_method", "put");
      }

      if (image) {
        formData.append("user_picture", image);
      }

      if (isEdit) {
        await Api.post(`user/${id}`, formData, requestConfig);
        toast.success("User updated successfully");
      } else {
        await Api.post("user", formData, requestConfig);
        toast.success("User created successfully");
      }

      navigate("/users");
    } catch (err) {
      console.log("SAVE USER ERROR:", err.response?.data || err);
      const apiMessage =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        "Failed to save user";
      toast.error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl relative p-8 max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => navigate("/users")}
            className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-8">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-8">
              <div className="relative w-28 h-28 rounded-full border-2 border-purple-500 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-sm text-center">No Image</div>
                )}

                <label className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full cursor-pointer shadow">
                  <FiUpload size={14} />
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>

                {preview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute bottom-0 left-0 bg-red-500 text-white p-2 rounded-full"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Name*</label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Email*</label>
                <input
                  type="email"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Phone Number*</label>
                <input
                  type="tel"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Title*</label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your title"
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Initials*</label>
                <input
                  type="text"
                  maxLength={5}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your initials"
                  value={form.initials}
                  onChange={(e) => handleFieldChange("initials", e.target.value.toUpperCase())}
                />
                {errors.initials && <p className="text-red-500 text-sm mt-1">{errors.initials}</p>}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Role*</label>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  value={form.role}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                >
                  <option value="">Select your role</option>
                  {roleOptions.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.title}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-4">Designation</h3>

              <div className="flex flex-wrap gap-8">
                {responsibilityOptions.map((r) => (
                  <label key={r.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.responsibilities.includes(String(r.id))}
                      onChange={() => toggleResponsibility(String(r.id))}
                      className="accent-purple-600"
                    />
                    {r.title}
                  </label>
                ))}
              </div>

              {errors.responsibilities && (
                <p className="text-red-500 text-sm mt-2">{errors.responsibilities}</p>
              )}
              {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
            >
              {loading ? "Saving..." : isEdit ? "Save" : "Add New User"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
