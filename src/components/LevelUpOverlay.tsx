import { motion, AnimatePresence } from "framer-motion";

interface LevelUpOverlayProps {
  level: number | null;
}

function LevelUpOverlay({ level }: LevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "4px" }}
            animate={{ opacity: 1, letterSpacing: "8px" }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ color: "#7c3aed", fontSize: "18px" }}
          >
            SYSTEM
          </motion.p>

          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ color: "white", fontSize: "48px", margin: "10px 0" }}
          >
            LEVEL UP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ color: "white", fontSize: "32px" }}
          >
            {level}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LevelUpOverlay;