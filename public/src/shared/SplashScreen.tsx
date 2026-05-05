import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fff7ed]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.75, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main pin */}
          <motion.path
            d="M90 10C67.4 10 49 28.4 49 51c0 31 41 76 41 76s41-45 41-76C131 28.4 112.6 10 90 10z"
            fill="#F97316"
            initial={{ scale: 0.88, opacity: 0, transformOrigin: "90px 70px" }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
          />

          <motion.circle
            cx="90"
            cy="53"
            r="31"
            fill="white"
            initial={{ scale: 0, transformOrigin: "90px 53px" }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, duration: 0.35, ease: "easeOut" }}
          />

          {/* Fork */}
          <motion.path
            d="M71 37v20M79 37v20M87 37v20M71 57c0 8 16 8 16 0M79 65v26"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.25 }}
          />

          {/* Spoon */}
          <motion.path
            d="M106 37c7 0 12 7 12 16s-5 16-12 16-12-7-12-16 5-16 12-16zM106 69v22"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.25 }}
          />

          {/* Smile */}
          <motion.path
            d="M72 76c5 7 11 10 18 10s13-3 18-10"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.35 }}
          />

          {/* Left child hugging */}
          <motion.g
            initial={{ opacity: 0, x: -46, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.05, duration: 0.45, ease: "easeOut" }}
          >
            <circle cx="48" cy="84" r="9" fill="#FDBA74" />
            <path d="M34 122c2-15 8-23 14-23s12 8 14 23" fill="#FDBA74" />
            <path d="M57 96c10 6 18 8 28 6" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" />
          </motion.g>

          {/* Right child hugging */}
          <motion.g
            initial={{ opacity: 0, x: 46, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.18, duration: 0.45, ease: "easeOut" }}
          >
            <circle cx="132" cy="84" r="9" fill="#FDBA74" />
            <path d="M118 122c2-15 8-23 14-23s12 8 14 23" fill="#FDBA74" />
            <path d="M123 96c-10 6-18 8-28 6" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" />
          </motion.g>

          {/* Final tiny bounce glow */}
          <motion.circle
            cx="90"
            cy="68"
            r="64"
            stroke="#FDBA74"
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0.85, transformOrigin: "90px 68px" }}
            animate={{ opacity: [0, 0.45, 0], scale: [0.85, 1.08, 1.16] }}
            transition={{ delay: 1.55, duration: 0.5 }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="mt-5 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.35 }}
      >
        <p className="text-xl font-extrabold text-slate-800">
          Dónde Comemos Hoy
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Un sitio pensado para toda la familia
        </p>
      </motion.div>
    </motion.div>
  );
}
