import React, { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import scanningAnimation from "./scan.json";
import assistant from "./assistant.json";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadHandler = async () => {
    if (!image) return alert("Upload an image!");

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setResult(data);
    setLoading(false);

    setHistory([
      ...history,
      {
        time: new Date().toLocaleTimeString(),
        type: data.waste_type,
        confidence: data.confidence,
        img: preview,
      },
    ]);
  };

  const tips = {
    Organic: [
      "Organic waste can be composted.",
      "Separate wet waste daily.",
      "Use biodegradable bags for kitchen waste.",
    ],
    Recyclable: [
      "Clean plastic before recycling.",
      "Separate glass, metal, and plastic properly.",
      "Don't mix recyclable items with wet waste.",
    ],
  };

  const icon = (type) => (type === "Organic" ? "🍃" : "♻️");

  return (
    <div className="min-h-screen flex bg-[#020617] text-white overflow-hidden">

      {/* SIDEBAR */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 bg-[#0a0f24] border-r border-gray-700/30 p-6 flex flex-col gap-6 shadow-2xl"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Waste AI
        </h1>

        <p className="text-gray-400 text-sm">
          Smart waste detection powered by AI.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mt-6 p-4 bg-white/10 rounded-xl border border-gray-700/30 backdrop-blur-lg"
        >
          <Lottie animationData={assistant} loop={true} />
        </motion.div>

        <h2 className="mt-4 text-lg font-semibold text-gray-300">History</h2>

        <div className="flex flex-col gap-3 overflow-y-auto h-72 pr-2">
          {history.length === 0 && (
            <p className="text-gray-500 text-sm">No predictions yet…</p>
          )}

          {history.map((h, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="p-3 bg-white/5 rounded-xl border border-gray-700/30 flex gap-3 items-center"
            >
              <img
                src={h.img}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{h.type}</p>
                <p className="text-gray-400 text-xs">{h.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MAIN PANEL */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg"
        >
          Smart Waste Classifier
        </motion.h1>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">

          {/* UPLOAD CARD */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white/10 backdrop-blur-xl shadow-xl rounded-3xl border border-gray-700/30"
          >
            <h2 className="text-2xl font-semibold mb-4">Upload Image</h2>

            {/* Upload Box */}
            <div
              className="border-2 border-gray-500/50 hover:border-blue-400 transition p-10 rounded-xl text-center cursor-pointer bg-white/5"
              onClick={() => document.getElementById("file").click()}
            >
              <div className="text-5xl mb-2">📤</div>
              <p className="text-gray-300">Click to Upload</p>
              <input
                type="file"
                id="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            {/* Preview */}
            {preview && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                className="rounded-2xl mt-6 w-full object-contain max-h-80 shadow-lg"
              />
            )}

            <button
              onClick={uploadHandler}
              className="mt-6 w-full px-6 py-3 text-lg bg-gradient-to-r from-blue-500 to-green-500 rounded-xl shadow-lg hover:scale-105 transition active:scale-95"
            >
              Analyze Image
            </button>
          </motion.div>

          {/* RESULT CARD */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-xl text-center"
          >
            {loading && (
              <div className="w-full">
                <Lottie animationData={scanningAnimation} height={250} />
                <p className="text-gray-300 mt-2">Scanning image...</p>
              </div>
            )}

            {result && !loading && (
              <div className="animate-fadeIn">
                <div className="text-7xl mb-4">{icon(result.waste_type)}</div>

                <h2 className="text-4xl font-bold mb-6">
                  {result.waste_type}
                </h2>

                <div className="w-40 mx-auto">
                  <CircularProgressbar
                    value={parseFloat(result.confidence)}
                    text={`${result.confidence}`}
                    styles={buildStyles({
                      textColor: "#fff",
                      pathColor:
                        result.waste_type === "Organic"
                          ? "#22c55e"
                          : "#3b82f6",
                      trailColor: "#1e293b",
                      textSize: "10px",
                    })}
                  />
                </div>

                <h3 className="mt-8 text-xl font-semibold">Recycling Tips</h3>

                <ul className="mt-4 text-left px-8 list-disc text-gray-300">
                  {tips[result.waste_type].map((t, i) => (
                    <li key={i} className="mt-2">{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
