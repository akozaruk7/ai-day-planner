import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Виконуємо в Node-рантаймі (SDK потребує Node, не Edge).
export const runtime = "nodejs";

// Схема структурованого виводу — «контракт» між AI та інтерфейсом.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          estimateMin: { anyOf: [{ type: "integer" }, { type: "null" }] },
          deadline: { anyOf: [{ type: "string" }, { type: "null" }] },
          isToday: { type: "boolean" },
          suggested: { type: "boolean" },
        },
        required: [
          "title",
          "priority",
          "estimateMin",
          "deadline",
          "isToday",
          "suggested",
        ],
      },
    },
  },
  required: ["tasks"],
} as const;

function systemPrompt(today: string): string {
  return `You turn a messy brain-dump into structured to-do tasks. Today's date is ${today}.

For every distinct actionable item in the dump, output a task:
- title: a short, clear imperative (e.g. "Call mom", "Finish the deck"). Clean it up; drop filler.
- priority: "low" | "medium" | "high" — see the prioritization principle below.
- estimateMin: a rough time estimate in whole minutes, or null if you truly can't tell.
- deadline: an ISO date "YYYY-MM-DD" ONLY if the text implies one (resolve "tomorrow", "Friday", "next week" relative to today). If no date is stated or implied, use null — NEVER invent a deadline.
- isToday: true only if the item is explicitly for today or clearly urgent/now.
- suggested: mark true for at most THREE items that are NOT already isToday — see the tiebreaker below. Everything else: false.

PRIORITIZATION PRINCIPLE (apply in this order):
1. IMPORTANCE is the backbone — infer it from the text even when no date is given. Signals of higher importance: real consequences or stakes if not done; someone else is affected or waiting (a client, boss, family) rather than only the user; it blocks other work; money, health, or commitments are involved. "Finish the client deck" outranks "maybe look into a gym".
2. URGENCY is only a booster — if a real deadline is near, bump priority up. Never let missing dates lower importance, and never fabricate urgency the text doesn't support.
3. EFFORT is the tiebreaker for 'suggested' — among important tasks, prefer quick wins (low estimateMin) to build momentum. Pick the 3 suggested this way.

Ignore vague musings that aren't tasks. If the dump contains no real tasks, return an empty array.`;
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Ключ не налаштовано в оточенні (Vercel env / .env.local).
    return NextResponse.json({ error: "missing_key" }, { status: 500 });
  }

  const client = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);

  try {
    // Форсуємо виклик інструмента — модель повертає валідний JSON у tool_use.input.
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: systemPrompt(today),
      messages: [{ role: "user", content: text }],
      tools: [
        {
          name: "save_tasks",
          description: "Save the structured tasks parsed from the brain dump.",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_schema: SCHEMA as any,
        },
      ],
      tool_choice: { type: "tool", name: "save_tasks" },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }

    const input = toolUse.input as { tasks?: unknown };
    const tasks = Array.isArray(input.tasks) ? input.tasks : [];
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("parse route error:", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
