# Journey Recovery — v2 (NICE Agentic Analytics edition)

A **second, separate** prototype — the original is untouched at `../journey-recovery/`.

This one reframes Journey Recovery around the QM-expert steer and the gap analysis: it's skinned
to look like a native page **inside Agentic Analytics** (same left nav, gradient titles, filter
pills, KPI cards, radar/donut charts, Sessions to Investigate, Transcript Viewer) and tells the
four-move story:

1. **Classify the escalation** — rightful-human vs. avoidable (Overview → Escalation Quality)
2. **Score the human's recovery** on the hard ones — QM/AutoScore criteria pointed at the human leg
   (Recovery Quality → Human Recovery Quality radar)
3. **Assist the agent** — what it takes to act (Transcript Viewer → right-hand Assist panel)
4. **Learn from the best recoverers** — mined plays that flow into the Assist (Recovery Playbook)

## Run it
Just open `index.html` in a browser (self-contained, no server). Click the tabs, and click a row in
**Recovery Quality → Sessions to Investigate** to open the stitched-journey Transcript Viewer
(AI leg → dead zone → human leg + Assist).

## Net-new vs. the product (see `../journey-recovery/docs/agentic-analytics-gap-analysis.md`)
Everything up to "I'm connecting you to a specialist" already ships. This prototype is the part that
goes dark today: the human leg, the recovery, whether it stuck, and turning the best recoverers into
propagated best practice.
