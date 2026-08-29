import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string | null;
}

function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#7c3aed",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 1000,
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;