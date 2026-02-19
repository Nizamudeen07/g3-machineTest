import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserList from "./pages/UserList";
import AddEditUser from "./pages/AddEditUser";
import PrivateRoute from "./routes/PrivateRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* User List */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          }
        />

        {/* Add User */}
        <Route
          path="/users/add"
          element={
            <PrivateRoute>
              <AddEditUser />
            </PrivateRoute>
          }
        />

        {/* Edit User */}
        <Route
          path="/users/edit/:id"
          element={
            <PrivateRoute>
              <AddEditUser />
            </PrivateRoute>
          }
        />

      </Routes>
    </>
  );
}
