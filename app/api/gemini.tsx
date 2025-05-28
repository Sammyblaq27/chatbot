// pages/api/gemini.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "Error connecting to Gemini API." });
  }
}
