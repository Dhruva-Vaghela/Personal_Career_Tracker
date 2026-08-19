export interface AiProvider {
  /**
   * Generates a raw JSON string from the given prompts.
   * @param systemPrompt Instructions dictating persona and strict JSON schema.
   * @param userPrompt The context-aware task instructions.
   * @returns A promise resolving to the raw JSON string output.
   */
  generateJson(systemPrompt: string, userPrompt: string): Promise<string>;
}
