import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import toast from "react-hot-toast";
import { FiTrash2, FiUpload } from "react-icons/fi";
import Api from "../services/api";

const ROLE_OPTIONS = ["Admin", "Manager", "User"];
const RESPONSIBILITY_OPTIONS = [
  "Designer",
  "Project Manager",
  "Production Manager",
  "Sales Rep",
];

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

 
  // Fetch User (Edit Mode)
 
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await Api.get(`api/user/${id}`, {
      
          Authorization: `Bearer ${token}`,
          "company-id": "01kht23rrecmnvgq3881194312",
          Accept: "application/json",
       
      });
  
      console.log("User Edit Response:", res);
  
      const data = res.data?.data;
  
      if (!data) return;
  
      setForm({
        name: data.name || 
              `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email || "",
        phone: data.phone || "",
        title: data.title || "",
        initials: data.initials || "",
        role: data.role?.id || data.role || "",   // handle object or string
        responsibilities: data.responsibilities || [],
      });
  
      setPreview(data.user_picture_url || null);
  
    } catch (err) {
      console.log("FETCH USER ERROR:", err.response?.data || err);
      toast.error("Failed to load user data");
    }
  }, [id]);

  useEffect(() => {
    if (isEdit && id) {
      fetchUser();
    }
  }, [fetchUser, id, isEdit]);
  
 
  // Validation
 
  const validate = () => {
    const err = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const normalizedPhone = trimmedPhone.replace(/[^\d]/g, "");
    const trimmedTitle = form.title.trim();
    const trimmedInitials = form.initials.trim().toUpperCase();

    if (!trimmedName) {
      err.name = "Name is required.";
    } else if (!/^[A-Za-z][A-Za-z\s'.-]{1,49}$/.test(trimmedName)) {
      err.name = "Name must be 2-50 characters and contain only letters.";
    }

    if (!trimmedEmail) {
      err.email = "Email is required.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)
    ) {
      err.email = "Please enter a valid email address.";
    }

    if (!trimmedPhone) {
      err.phone = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(normalizedPhone)) {
      err.phone =
        "Phone number must contain 10-15 digits (spaces/dashes allowed).";
    }

    if (!trimmedTitle) {
      err.title = "Title is required.";
    } else if (!/^[A-Za-z][A-Za-z\s'.-]{1,49}$/.test(trimmedTitle)) {
      err.title = "Title must be 2-50 characters and contain only letters.";
    }

    if (!trimmedInitials) {
      err.initials = "Initials are required.";
    } else if (!/^[A-Z]{2,5}$/.test(trimmedInitials)) {
      err.initials = "Initials must be 2-5 uppercase letters.";
    }

    if (!form.role) {
      err.role = "Role is required.";
    }

    if (form.responsibilities.length === 0) {
      err.responsibilities = "Select at least one responsibility.";
    } else if (
      form.responsibilities.some(
        (responsibility) =>
          !RESPONSIBILITY_OPTIONS.includes(responsibility)
      )
    ) {
      err.responsibilities = "One or more selected responsibilities are invalid.";
    }

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

 
  // Handle Image
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors((prev) => ({ ...prev, image: "" }));
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

 
  // Handle Responsibility
 
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
    setErrors((prev) => ({ ...prev, responsibilities: "" }));
  };

 
  // Submit
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim().replace(/[^\d]/g, ""),
        title: form.title.trim(),
        initials: form.initials.trim().toUpperCase(),
      };

      Object.keys(payload).forEach((key) => {
        if (key === "responsibilities") {
          payload.responsibilities.forEach((r) =>
            formData.append("responsibilities[]", r)
          );
        } else {
          formData.append(key, payload[key]);
        }
      });

      if (image) {
        formData.append("user_picture", image);
      }

      if (isEdit) {
        await Api.post(`api/user/${id}`, formData);
        toast.success("User updated successfully");
      } else {
        await Api.post("api/user", formData);
        toast.success("User created successfully");
      }

      navigate("/users");
    } catch {
      toast.error("Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        
        {/* Modal */}
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl relative p-8 max-h-[90vh] overflow-y-auto">
  
          {/* Close Button */}
          <button
            onClick={() => navigate("/users")}
            className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
  
          {/* Title */}
          <h2 className="text-2xl font-semibold mb-8">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
  
          <form onSubmit={handleSubmit}>
            
            {/* Profile Image */}
            <div className="flex justify-center mb-8">
              <div className="relative w-28 h-28 rounded-full border-2 border-purple-500 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    No Image
                  </div>
                )}
  
                {/* Upload */}
                <label className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full cursor-pointer shadow">
                  <FiUpload size={14} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
  
                {/* Delete */}
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
  
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Name*
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
  
              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Email*
                </label>
                <input
                  type="email"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
  
              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
  
              {/* Title */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Title*
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your title"
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title}
                  </p>
                )}
              </div>
  
              {/* Initials */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Initials*
                </label>
                <input
                  type="text"
                  maxLength={5}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="Enter your initials"
                  value={form.initials}
                  onChange={(e) =>
                    handleFieldChange("initials", e.target.value.toUpperCase())
                  }
                />
                {errors.initials && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.initials}
                  </p>
                )}
              </div>
  
              {/* Role */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Role*
                </label>
                <select
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400 outline-none"
                  value={form.role}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                >
                  <option value="">Select your role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.role}
                  </p>
                )}
              </div>
            </div>
  
            {/* Responsibilities */}
            <div className="mt-8">
              <h3 className="font-medium mb-4">
                Designation
              </h3>
  
              <div className="flex flex-wrap gap-8">
                {RESPONSIBILITY_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.responsibilities.includes(r)}
                    onChange={() => toggleResponsibility(r)}
                    className="accent-purple-600"
                  />
                  {r}
                </label>
              ))}
              </div>
              {errors.responsibilities && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.responsibilities}
                </p>
              )}
              {errors.image && (
                <p className="text-red-500 text-sm mt-2">{errors.image}</p>
              )}
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full py-3 rounded-lg text-white font-medium 
                         bg-gradient-to-r from-purple-500 to-indigo-500 
                         hover:opacity-90 transition"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Save"
                : "Add New User"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
  
}
