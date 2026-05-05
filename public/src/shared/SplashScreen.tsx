import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fff7ed]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, y: 18, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M66 8C43.9 8 26 25.9 26 48c0 30.2 40 74 40 74s40-43.8 40-74C106 25.9 88.1 8 66 8z"
              fill="#F97316"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45 }}
            />
            <motion.circle
              cx="66"
              cy="50"
              r="30"
              fill="white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.28, duration: 0.35, ease: "easeOut" }}
            />

            <motion.path
              d="M48 34v20M56 34v20M64 34v20M48 54c0 8 16 8 16 0M56 62v28"
              stroke="#F97316"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.25 }}
            />

            <motion.path
              d="M82 34c7 0 12 7 12 16s-5 16-12 16-12-7-12-16 5-16 12-16zM82 66v24"
              stroke="#F97316"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.25 }}
            />

            <motion.path
              d="M48 70c5 8 11 12 18 12s13-4 18-12"
              stroke="#F97316"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.82, duration: 0.35 }}
            />

            <motion.g
              initial={{ opacity: 0, x: -24, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.05, duration: 0.35, ease: "easeOut" }}
            >
              <circle cx="52" cy="88" r="8" fill="#F97316" />
              <path d="M38 112c2-12 8-18 14-18s12 6 14 18" fill="#F97316" />
            </motion.g>

            <motion.g
              initial={{ opacity: 0, x: 24, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.15, duration: 0.35, ease: "easeOut" }}
            >
              <circle cx="79" cy="91" r="7" fill="#F97316" />
              <path d="M66 114c2-11 7-17 13-17s11 6 13 17" fill="#F97316" />
            </motion.g>
          </svg>
        </motion.div>

        <motion.p
          className="mt-4 text-sm font-bold text-orange-600"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.3 }}
        >
          Un sitio pensado para toda la familia
        </motion.p>
      </div>
    </motion.div>
  );
}
