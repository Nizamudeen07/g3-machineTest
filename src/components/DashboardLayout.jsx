import { NavLink } from "react-router-dom";
import dashboardIcon from "@assets/dashboard.svg"
import userIcon from "@assets/user.svg"
import teamsIcon from "@assets/team.svg"
import logoutIcon from "@assets/power.svg"
import settingsIcon from "@assets/settings.svg"


export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen px-[18px] py-[27px] bg-white">
      <div className="w-[200px]  bg-[#504A6E] rounded-md text-white py-4 px-2 flex flex-col justify-between">
        <div>
          <h1 className="text-[48px] text-center font-medium ">LOGO</h1>

<p className="text-[#E7E7E6] font-normal text-xs mt-10 ">MAIN MENU</p>

          <div className="space-y-4 mt-4">
            <NavLink
              
              className="gap-2 font-normal px-4 py-1  text-[#E7E7E6] text-sm flex rounded hover:bg-[#8570FF]"
            ><img src={dashboardIcon} alt="" />
             Dashboard
            </NavLink>
            <NavLink
              to="/users"
              className="gap-2  flex rounded px-4 py-1  font-normal text-[#E7E7E6] text-sm  bg-[#8570FF]"
            ><img src={userIcon} alt="" />
              User Management
            </NavLink>
            <NavLink
              
              className="gap-2 font-normal px-4 py-1  text-[#E7E7E6] text-sm item-center flex rounded hover:bg-[#8570FF]"
            ><img src={teamsIcon} alt="" />
              Team
            </NavLink>
          </div>
          <p className="text-[#E7E7E6] font-normal text-xs mt-10 ">SETTINGS</p>
          <NavLink
              
              className="gap-2 mt-4 font-normal px-4 py-1  text-[#E7E7E6] text-sm flex rounded hover:bg-[#8570FF]"
            ><img src={settingsIcon} alt="" />
             Settings
            </NavLink>

        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="flex items-center font-normal text-sm px-4 text-[#E7E7E6]  gap-2 text-center "
        >
        <img src={logoutIcon} className="w-[18px] h-[18px]" alt="" />
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
