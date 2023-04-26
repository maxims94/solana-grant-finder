import { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { query } = req.body as { query: string };

        if (query === undefined) {
            res.status(400).json({ error: "Bad request" })
        }

        console.log("Get embedding for:", query);

        console.log("Request embedding...")

        if (!process.env.OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API key")
        }

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const embedding = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: query,
        })

        console.log("Done")

        res.status(200).json({ embedding: embedding.data.data[0].embedding })
    } else {
        res.status(400).json({ error: "Bad request" })
    }
}