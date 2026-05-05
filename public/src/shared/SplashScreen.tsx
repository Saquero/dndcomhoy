import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fff7ed]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.img
        src="/splash-family.png"
        alt="DCH Family"
        className="w-40 sm:w-52"
        initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xl font-extrabold text-slate-800">
          Dónde Comemos Hoy
        </p>
        <p className="text-sm text-slate-500">
          Un sitio pensado para toda la familia
        </p>
      </motion.div>
    </motion.div>
  );
}
