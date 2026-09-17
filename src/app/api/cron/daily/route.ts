import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { currentStreakDays } from "@/lib/streak";
import { getTier, TIERS, LEGEND_MIN } from "@/lib/tiers";
import { dayWord } from "@/lib/format";
import { sendEmail, emailShell } from "@/lib/email";

export const maxDuration = 60;

/**
 * Runs once a day (vercel.json). Streaks are computed on read and nothing
 * happens at midnight on its own, so this is what turns "you crossed a
 * milestone" into an email.
 *
 * Every send is recorded in email_log, which has a unique index on
 * (user, streak, kind, marker). A retry, an overlapping run, or a manual
 * trigger therefore cannot send the same congratulation twice - the
 * insert simply conflicts and is skipped.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    select d.id, d.name, d.kind, d.goal_days, d.start_date, d.user_id,
           u."email" as email, u."name" as user_name,
           coalesce(s.email_milestones, true) as opted_in
    from disciplines d
    join "user" u on u."id" = d.user_id
    left join user_settings s on s.user_id = d.user_id
    where d.archived = false and d.start_date is not null
  `;

  let sent = 0;
  let skipped = 0;

  for (const r of rows) {
    if (!r.opted_in || !r.email) { skipped++; continue; }

    const days = currentStreakDays(r.start_date);
    if (days < 1) continue;

    const isSprint = r.kind === "sprint" && !!r.goal_days;
    let kind: string | null = null;
    let marker = "";
    let title = "";
    let body = "";

    if (isSprint && days === r.goal_days) {
      kind = "sprint_complete";
      marker = String(days);
      title = `${r.name} — sprint complete`;
      body = `<p style="margin:0 0 12px;color:#F2ECE3;font-size:15px;line-height:1.6">You set ${days} ${dayWord(days)} and you got there. Done.</p>
<p style="margin:0;color:#A79C8C;font-size:14px;line-height:1.6">When you're ready, finish and archive it so it's recorded properly.</p>`;
    } else if (!isSprint && TIERS.some((t) => t.min === days)) {
      const tier = getTier(days);
      kind = "milestone";
      marker = String(days);
      title = `${r.name} — ${tier.name}`;
      body = `<p style="margin:0 0 6px;color:${tier.color};font-size:13px;font-weight:700;letter-spacing:1.5px">${tier.name.toUpperCase()} · DAY ${days}</p>
<p style="margin:0 0 12px;color:#F2ECE3;font-size:17px;font-weight:700">${tier.line}</p>
<p style="margin:0;color:#A79C8C;font-size:14px;line-height:1.6">${
        days >= LEGEND_MIN
          ? "A full year. You can finish and archive this one whenever you like — it's earned."
          : "Still going. Keep the commitment alive."
      }</p>`;
    }

    if (!kind) continue;

    // Claim the send first. If this conflicts, another run already did it.
    const claim = await sql`
      insert into email_log (user_id, discipline_id, kind, marker)
      values (${r.user_id}, ${r.id}, ${kind}, ${marker})
      on conflict do nothing
      returning id
    `;
    if (claim.length === 0) { skipped++; continue; }

    const ok = await sendEmail({
      to: r.email,
      toName: r.user_name ?? undefined,
      subject: title,
      html: emailShell(title, body),
    });

    if (ok) {
      sent++;
    } else {
      // Release the claim so tomorrow's run can retry a failed send.
      await sql`delete from email_log where id = ${claim[0].id}`;
    }
  }

  return NextResponse.json({ ok: true, considered: rows.length, sent, skipped });
}
