// Supabase Edge Function for AI-assisted packing suggestions
// Takes rule-based suggestions + trip context and returns AI-polished results
// Deploy with: supabase functions deploy suggest-packing

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { suggestions, tripContext } = await req.json();

    if (!suggestions || !tripContext) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: suggestions, tripContext' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

    // If no API key, return rule-based suggestions as-is with generated explanations
    if (!apiKey) {
      const fallbackItems = suggestions.items.map((item: {
        itemId: string;
        name: string;
        category: string;
        score: number;
        reasons: string[];
      }) => ({
        ...item,
        aiExplanation: item.reasons.join('. ') + '.',
      }));

      return new Response(
        JSON.stringify({
          items: fallbackItems,
          summary: `Packed ${fallbackItems.length} items for your ${tripContext.duration}-day ${tripContext.tripType} trip.`,
          aiPowered: false,
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Build prompt for Claude
    const prompt = buildPrompt(suggestions, tripContext);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, await response.text());
      // Fall back to rule-based suggestions
      const fallbackItems = suggestions.items.map((item: {
        itemId: string;
        name: string;
        category: string;
        score: number;
        reasons: string[];
      }) => ({
        ...item,
        aiExplanation: item.reasons.join('. ') + '.',
      }));

      return new Response(
        JSON.stringify({
          items: fallbackItems,
          summary: `Packed ${fallbackItems.length} items for your ${tripContext.duration}-day ${tripContext.tripType} trip.`,
          aiPowered: false,
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const claudeResponse = await response.json();
    const aiText = claudeResponse.content?.[0]?.text || '';

    // Parse AI response
    const parsed = parseAIResponse(aiText, suggestions.items);

    return new Response(
      JSON.stringify({
        ...parsed,
        aiPowered: true,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Error in suggest-packing:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate packing suggestions' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});

interface SuggestedItem {
  itemId: string;
  name: string;
  category: string;
  score: number;
  reasons: string[];
}

function buildPrompt(
  suggestions: { items: SuggestedItem[]; categoryBreakdown: Record<string, { needed: number; suggested: number }> },
  tripContext: { duration: number; tripType: string; formality: number; destination?: string; weatherSummary?: string }
): string {
  const itemList = suggestions.items
    .map((item, i) => `${i + 1}. ${item.name} (${item.category}, score: ${item.score.toFixed(2)})`)
    .join('\n');

  const categoryList = Object.entries(suggestions.categoryBreakdown)
    .map(([cat, { needed, suggested }]) => `  ${cat}: ${suggested}/${needed} needed`)
    .join('\n');

  return `You are a packing assistant. Given these rule-based packing suggestions for a trip, provide:
1. A brief 1-2 sentence summary of the packing plan
2. For each item, a one-sentence explanation of why it was included

Trip details:
- Duration: ${tripContext.duration} days
- Type: ${tripContext.tripType}
- Formality level: ${tripContext.formality}/5
${tripContext.destination ? `- Destination: ${tripContext.destination}` : ''}
${tripContext.weatherSummary ? `- Weather: ${tripContext.weatherSummary}` : ''}

Category breakdown:
${categoryList}

Suggested items:
${itemList}

Respond in JSON format:
{
  "summary": "Brief packing plan summary",
  "items": [
    { "itemId": "...", "aiExplanation": "One sentence why this item is good for the trip" }
  ]
}`;
}

function parseAIResponse(
  aiText: string,
  originalItems: SuggestedItem[]
): { items: (SuggestedItem & { aiExplanation: string })[]; summary: string } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const parsed = JSON.parse(jsonMatch[0]);

    // Map AI explanations back to items
    const aiExplanations = new Map<string, string>();
    if (Array.isArray(parsed.items)) {
      for (const item of parsed.items) {
        if (item.itemId && item.aiExplanation) {
          aiExplanations.set(item.itemId, item.aiExplanation);
        }
      }
    }

    const enrichedItems = originalItems.map((item) => ({
      ...item,
      aiExplanation: aiExplanations.get(item.itemId) || item.reasons.join('. ') + '.',
    }));

    return {
      items: enrichedItems,
      summary: parsed.summary || `Packed ${originalItems.length} items for your trip.`,
    };
  } catch {
    // If parsing fails, return items with reason-based explanations
    return {
      items: originalItems.map((item) => ({
        ...item,
        aiExplanation: item.reasons.join('. ') + '.',
      })),
      summary: `Packed ${originalItems.length} items for your trip.`,
    };
  }
}
