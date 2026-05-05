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
        <motion.svg
          width="136"
          height="136"
          viewBox="0 0 136 136"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M68 8C45.4 8 27 26.4 27 49c0 31 41 76 41 76s41-45 41-76C109 26.4 90.6 8 68 8z"
            fill="#F97316"
          />

          <circle cx="68" cy="51" r="31" fill="white" />

          <motion.path
            d="M49 35v20M57 35v20M65 35v20M49 55c0 8 16 8 16 0M57 63v26"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.25 }}
          />

          <motion.path
            d="M84 35c7 0 12 7 12 16s-5 16-12 16-12-7-12-16 5-16 12-16zM84 67v22"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.25 }}
          />

          <motion.path
            d="M50 72c5 7 11 10 18 10s13-3 18-10"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.35 }}
          />

          <motion.g
            initial={{ opacity: 0, x: -34, scale: 0.75 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.95, duration: 0.45, ease: "easeOut" }}
          >
            <circle cx="53" cy="92" r="8" fill="#F97316" />
            <path d="M39 116c2-13 8-19 14-19s12 6 14 19" fill="#F97316" />
          </motion.g>

          <motion.g
            initial={{ opacity: 0, x: 34, scale: 0.75 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.08, duration: 0.45, ease: "easeOut" }}
          >
            <circle cx="82" cy="94" r="7" fill="#F97316" />
            <path d="M69 116c2-12 7-18 13-18s11 6 13 18" fill="#F97316" />
          </motion.g>
        </motion.svg>
      </motion.div>

      <motion.div
        className="mt-6 text-center"
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
