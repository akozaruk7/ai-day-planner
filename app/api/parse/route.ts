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
          category: {
            type: "string",
            enum: ["work", "sport", "leisure", "family", "chores", "other"],
          },
          estimateMin: { anyOf: [{ type: "integer" }, { type: "null" }] },
          deadline: { anyOf: [{ type: "string" }, { type: "null" }] },
          isToday: { type: "boolean" },
          suggested: { type: "boolean" },
        },
        required: [
          "title",
          "priority",
          "category",
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

function systemPrompt(
  today: string,
  outputLang: string,
  availableMin: number
): string {
  return `You turn a messy brain-dump into structured to-do tasks. Today's date is ${today}.

Write every task "title" in ${outputLang}, regardless of the language of the dump.

TIME LEFT TODAY: about ${availableMin} minutes before the user goes to sleep. Respect it when choosing what is for today: the combined estimateMin of all tasks you mark isToday=true OR suggested=true must not exceed about ${availableMin} minutes. Prefer fewer, higher-priority tasks that actually fit. A task with an explicit hard deadline of today still gets isToday=true even if time is tight, but do NOT pad "today" with discretionary items that won't fit. If almost no time remains, it is fine to mark nothing for today (everything goes to the inbox).

For every distinct actionable item in the dump, output a task:
- title: a short, clear imperative (e.g. "Call mom", "Finish the deck"). Clean it up; drop filler.
- priority: "low" | "medium" | "high" — see the prioritization principle below.
- category: the kind of activity — one of "work", "sport", "leisure", "family", "chores", "other". This app plans the whole day, so sport, leisure, and family time are valid tasks, not just work. Pick "other" only if none fit.
- estimateMin: a rough time estimate as ONE of these buckets of minutes: 5, 15, 30, 60, 120. Pick the closest bucket from the task's type and complexity (a quick message/call ~5–15, a focused task ~30–60, something big or vague ~120). Use null only if you genuinely cannot tell.
- deadline: an ISO date "YYYY-MM-DD" ONLY if the text implies one (resolve "tomorrow", "Friday", "next week" relative to today). If no date is stated or implied, use null — NEVER invent a deadline.
- isToday: true only if the item is explicitly for today or clearly urgent/now.
- suggested: mark true for at most THREE items that are NOT already isToday — see the tiebreaker below. Everything else: false.

PRIORITIZATION PRINCIPLE (apply in this order):
1. IMPORTANCE is the backbone — infer it from the text even when no date is given. Signals of higher importance: real consequences or stakes if not done; someone else is affected or waiting (a client, boss, family) rather than only the user; it blocks other work; money, health, or commitments are involved. "Finish the client deck" outranks "maybe look into a gym".
2. URGENCY is only a booster — if a real deadline is near, bump priority up. Never let missing dates lower importance, and never fabricate urgency the text doesn't support.
3. EFFORT is the tiebreaker for 'suggested' — among important tasks, prefer quick wins (low estimateMin) to build momentum. Pick the 3 suggested this way.

Ignore vague musings that aren't tasks. If the dump contains no real tasks, return an empty array.`;
}

// Чи згадує текст хоч якусь дату/час — щоб у коді відкидати вигадані дедлайни.
function mentionsDate(text: string): boolean {
  const t = text.toLowerCase();
  if (/\d{4}-\d{2}-\d{2}|\b\d{1,2}[./]\d{1,2}\b/.test(t)) return true;
  if (/\b\d{1,2}\s*(дн(і|ів|я)|день|тижн|week|days?|month|місяц)/.test(t))
    return true;
  if (
    /сьогодн|завтра|післязавтра|позавтра|наступн|цьому тижн|цього тижн|вихідн|понеділ|вівтор|серед[ау]|четвер|п.?ятниц|субот|неділ|дедлайн|термін/.test(
      t
    )
  )
    return true;
  if (
    /today|tomorrow|tonight|next\s+(week|month|day)|deadline|\bdue\b|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december/.test(
      t
    )
  )
    return true;
  return false;
}

export async function POST(req: Request) {
  let text = "";
  let outputLang = "Ukrainian";
  let availableMin = 960; // fallback: повний день неспання
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
    outputLang = body?.lang === "en" ? "English" : "Ukrainian";
    if (typeof body?.availableMin === "number" && body.availableMin >= 0) {
      availableMin = Math.round(body.availableMin);
    }
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
      system: systemPrompt(today, outputLang, availableMin),
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
    const rawTasks = Array.isArray(input.tasks) ? input.tasks : [];
    // Захист у коді: якщо в тексті немає жодної згадки дати — відкидаємо
    // будь-які дедлайни (модель інколи додає їх усупереч інструкції).
    const tasks = mentionsDate(text)
      ? rawTasks
      : rawTasks.map((t) =>
          t && typeof t === "object" ? { ...(t as object), deadline: null } : t
        );
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("parse route error:", err);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
