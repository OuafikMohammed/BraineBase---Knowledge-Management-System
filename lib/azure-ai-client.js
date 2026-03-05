import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function generateResumeSummary(text, token, temperature = 0.7, top_p = 0.7) {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates concise, professional summaries from text. Keep the key points and main ideas, remove redundancy, and maintain a clear flow."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature,
      top_p,
      model,
      max_tokens: 1000
    }
  });

  if (isUnexpected(response)) {
    throw new Error("AI API call failed");
  }

  return response.body.choices[0].message.content;
}
