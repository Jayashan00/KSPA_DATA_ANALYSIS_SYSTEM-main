import React from "react";

const Button = ({ children, variant = "primary", ...props }) => {
  const baseClasses =
    "w-full py-3 px-5 rounded-full text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-md outline-none relative overflow-hidden";

  const primaryClasses =
    "bg-gradient-to-br from-[#ff6600] to-[#cc3500] text-white hover:from-[#cc3500] hover:to-[#ff5500] hover:-translate-y-[3px] hover:shadow-lg focus:ring-4 focus:ring-[#ff6600]/30 active:after:scale-100";

  const secondaryClasses =
    "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:-translate-y-[2px] focus:ring-4 focus:ring-gray-400/30 active:after:scale-100";

  return (
    <button
      {...props}
      className={`${baseClasses} ${
        variant === "primary" ? primaryClasses : secondaryClasses
      } after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[300%] after:h-[300%] after:bg-white/5 after:transition-all after:duration-[600ms] after:ease-in-out after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 after:rounded-full`}
    >
      {children}
    </button>
  );
};

export default Button;