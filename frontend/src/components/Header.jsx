import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.avif";
import { logout } from "../redux/authSlice";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

function Header() {
  const nav = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();
  const navItems = [
    {
      name: "About Us",
      path: "/about-us",
      active: true,
    },
    {
      name: "Book a Ride",
      path: "/vehicles",
      active: true,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      active: true,
    },
    {
      name: "My Rides",
      path: "/history",
      active: authStatus,
    },
  ];

  const logoutHandler = async () => {
    try {
      const res = await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        dispatch(logout());
        nav("/");
      } else {
        toast.error("Logout failed:", await res.json());
      }
    } catch (error) {
      toast.error("Logout error:", error);
    }
  };

  return (
    <header className="w-full pt-3 bg-white border-b">
      <Toaster />
      <div className="w-full mx-auto px-4">
        <nav className="flex">
          <div className="mr-4 px-6 py-2 pb-3">
            <Link to="/">
              <img src={logo} width={120} />
            </Link>
          </div>
          <ul className="flex mx-auto">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => nav(item.path)}
                    className="inline-block px-6 py-2 duration-200 hover:text-blue-600 rounded-full"
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
          </ul>
          {authStatus && (
            <div className="ml-4">
              <button
                onClick={() => logoutHandler()}
                className="inline-block px-6 py-2 text-lg bg-black duration-200 text-white hover:bg-white hover:text-black rounded-md"
              >
                Logout
              </button>
            </div>
          )}
          {!authStatus && (
            <div className="ml-4">
              <button
                onClick={() => nav("/login")}
                className="inline-block px-6 py-2 text-lg bg-black duration-200 text-white hover:bg-white hover:text-black rounded-md"
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
