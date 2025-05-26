import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

export async function generateResumeSummary({ token, messages, temperature = 1, top_p = 1 }) {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages,
      temperature,
      top_p,
      model
    }
  });

  if (isUnexpected(response)) {
    throw new Error("AI API call failed");
  }

  return response.body.choices[0].message.content;
}
