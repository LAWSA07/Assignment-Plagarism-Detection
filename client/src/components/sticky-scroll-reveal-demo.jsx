import { motion } from "framer-motion";
import "./StickyScrollRevealDemo.css";

const content = [
  {
    title: "Instant Plagiarism Check",
    description: "Get results in seconds with our high-performance AI engine.",
    icon: "⚡",
    iconBg: "linear-gradient(135deg, #27ae60 60%, #145a32 100%)",
  },
  {
    title: "Secure & Private",
    description: "Your assignments and data are encrypted and never shared.",
    icon: "🔒",
    iconBg: "linear-gradient(135deg, #111 60%, #27ae60 100%)",
  },
  {
    title: "Detailed Reports",
    description: "Easy-to-read, actionable plagiarism reports for every submission.",
    icon: "📊",
    iconBg: "linear-gradient(135deg, #1e90ff 60%, #27ae60 100%)",
  },
  {
    title: "For Students & Professors",
    description: "Simple dashboards for both roles. No training required.",
    icon: "👩‍🏫",
    iconBg: "linear-gradient(135deg, #ffd600 60%, #27ae60 100%)",
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <>
      <div className="feature-tagline">
        <strong>Empowering Academic Integrity with AI-Driven Plagiarism Detection.</strong>
      </div>
      <div className="features-section">
        {content.map((item, idx) => (
          <motion.div
            className="feature-card animated-feature-card"
            key={item.title}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1, type: "spring" }}
            viewport={{ once: true }}
          >
            <div
              className="feature-icon"
              style={{
                background: item.iconBg,
                boxShadow: "0 4px 24px rgba(39, 174, 96, 0.18)",
              }}
            >
              {item.icon}
            </div>
            <div className="feature-title">{item.title}</div>
            <div className="feature-desc">{item.description}</div>
          </motion.div>
        ))}
      </div>
    </>
  );
} 