"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";

// Utility function for className concatenation (cn)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const StickyScroll = ({
  content,
  contentClassName,
}) => {
  return (
    <section className="w-full py-16 flex flex-col items-center bg-white">
      <div className="w-full max-w-4xl flex flex-col gap-12 px-4">
        {content.map((item, idx) => (
          <motion.div
            key={item.title + idx}
            initial={{ opacity: 0, x: -120 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-10 flex flex-col md:flex-row items-center gap-8 transition-transform hover:scale-[1.025] hover:shadow-2xl border border-gray-100"
            style={{ minHeight: 220 }}
          >
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h2>
              <p className="text-gray-700 text-lg mb-2">
                {item.description}
              </p>
              {item.details && (
                <ul className="list-disc pl-5 text-gray-600 mt-2 space-y-1">
                  {item.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
            {item.content && (
              <div className={cn("flex-shrink-0 w-40 h-40 flex items-center justify-center rounded-xl", contentClassName)} style={{ background: item.bg || undefined }}>
                {item.content}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}; 