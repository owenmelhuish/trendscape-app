export class AIParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string
  ) {
    super(message);
    this.name = "AIParseError";
  }
}

export function parseAIResponse<T>(raw: string): T {
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIParseError(
      "Failed to parse AI response as JSON",
      raw
    );
  }
}
