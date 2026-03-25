import Header from "./Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <>

      <style>
        {`
                .custom-scroll::-webkit-scrollbar {
                width: 10px;
                }

                .custom-scroll::-webkit-scrollbar-track {
                background: transparent;
                }

                .custom-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 253, 253, 0.2);
                border-radius: 10px;
                }

                .custom-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.6);
                }

                .custom-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }
            `}
      </style>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          background: `
          radial-gradient(circle at top right, rgba(168, 85, 247, 0.6), transparent 40%),
          radial-gradient(circle at top left, rgba(99, 102, 241, 0.5), transparent 40%),
          linear-gradient(180deg, #261e3b, #23447a)
        `,
          overflowY: "auto",
        }}
        className="custom-scroll"
      >
        <Header />

        <div style={{ padding: 0, marginTop: "70px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;