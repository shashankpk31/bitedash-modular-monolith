import React from "react";
import { motion } from "framer-motion";
import { ROLES } from "../../../config/constants";

const AuthToggle = ({ activeRole, setRole }) => {
  return (
    <div className="relative flex items-center w-64 h-11 bg-gray-100 rounded-full p-1 shadow-inner border border-gray-200">
      {}
      <motion.div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md z-0"
        initial={false}
        animate={{
          x: activeRole === ROLES.EMPLOYEE ? 0 : "100%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {}
      <button
        type="button"
        onClick={() => setRole(ROLES.EMPLOYEE)}
        className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-200 ${
          activeRole === ROLES.EMPLOYEE ? "text-orange-600" : "text-gray-500"
        }`}
      >
        Employee
      </button>

      {}
      <button
        type="button"
        onClick={() => setRole(ROLES.VENDOR)}
        className={`relative z-10 flex-1 text-sm font-bold transition-colors duration-200 ${
          activeRole === ROLES.VENDOR ? "text-orange-600" : "text-gray-500"
        }`}
      >
        Vendor
      </button>
    </div>
  );
};

export default AuthToggle;
