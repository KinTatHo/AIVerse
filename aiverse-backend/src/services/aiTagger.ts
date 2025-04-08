import axios from 'axios';

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_ZERO_SHOT_MODEL_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli'; // Or another suitable zero-shot model

// Define your desired AI sub-topic labels
const AI_TOPIC_LABELS = [
    "Large Language Models",
    "Computer Vision",
    "AI Ethics",
    "Reinforcement Learning",
    "AI Hardware",
    "Generative AI",
    "Robotics",
    "AI Regulation",
    "Machine Learning Research",
    "Natural Language Processing" // Now exactly 10 labels
];

/**
 * Gets relevant AI topic tags for a given text using Zero-Shot Classification.
 * @param text The text to classify (e.g., title + description).
 * @param threshold Minimum confidence score for a label to be included (e.g., 0.7).
 * @returns An array of topic strings.
 */
export async function getTopicsForArticle(text: string, threshold = 0.7): Promise<string[]> {
    if (!HF_API_TOKEN) {
        console.warn("Hugging Face API Token not configured. Skipping topic tagging.");
        return [];
    }
    if (!text || text.trim().length < 25) { // Avoid tagging very short texts
         console.log("Skipping topic tagging for short text.");
         return [];
    }

    try {
        console.log(`AI Tagging: Getting topics for text starting with: "${text.substring(0, 70)}..."`);
        const response = await axios.post(HF_ZERO_SHOT_MODEL_URL, {
            inputs: text,
            parameters: {
                candidate_labels: AI_TOPIC_LABELS,
                multi_label: true // Important: Set to true if an article can have multiple topics
            }
        }, {
            headers: { 'Authorization': `Bearer ${HF_API_TOKEN}` }
        });

        const scores = response.data.scores as number[];
        const labels = response.data.labels as string[];

        // Filter labels that meet the confidence threshold
        const assignedTopics = labels.filter((label, index) => scores[index] >= threshold);

        console.log(`AI Tagging: Assigned topics: [${assignedTopics.join(', ')}]`);
        return assignedTopics;

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error("Hugging Face API error (Topic Tagging):", error.response?.data || error.message);
        } else {
            console.error("Error during AI topic tagging:", error);
        }
        return []; // Return empty array on error
    }
}