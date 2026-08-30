---
name: loan-app-review
description: Research and rank Tanzanian/Swahili mobile loan apps (app za mikopo) from their Google Play listings and user reviews, producing a countdown-ranked review covering interest (riba), repayment period (muda wa kurejesha), loan amounts, approval behaviour, customer support, what happens if you don't pay, and an honesty score. Use this whenever the user pastes Google Play links or package IDs for loan/credit/microfinance apps, asks to compare or rank mikopo apps, asks which loan apps are safe or which are scams, wants to know an app's real riba or repayment terms, or is preparing a video, article or list about loan apps. Trigger it even when they just paste Play Store links with little explanation, or ask something like "chunguza app hizi za mikopo" or "which of these loan apps is legit".
---

# Loan app review

Turn Google Play listings and their reviews into an honest, evidence-backed countdown
of loan apps — the review a borrower actually needs before they tap "Apply".

Loan apps are unusual to research because **the listing tells you almost nothing that
matters**. Interest, repayment window, real loan sizes, what collections do to you when
you're late — none of it is on the store page. All of it is in the reviews, written by
people it happened to, mostly in Swahili. The job is to mine that, weigh it honestly,
and rank.

## Workflow

### 1. Get the list of apps

The user usually pastes Play Store links or package IDs. Take them as given.

If they don't supply a list, or ask for "the trending ones", build the list yourself:

```bash
python3 scripts/playstore.py search "mikopo tanzania" --gl TZ --limit 30
python3 scripts/playstore.py search "mkopo" --gl TZ --limit 30
```

Play's search order reflects current store ranking, so the first results are the ones
people are actually installing. Show the user the shortlist and confirm before scanning
— scanning is the slow part, and reviewing an app they didn't mean to include wastes it.

### 2. Scan

```bash
python3 scripts/playstore.py scan <pkg-or-url> [more...] --want 300 --out scan.json
```

This fetches, for each app: store details (rating, histogram, installs, developer,
contact email, privacy policy, updated date), up to ~300 reviews, a tally of risk
signals, extracted money/day/percentage mentions, and review-integrity stats.

Two behaviours worth knowing, both already handled by the script — don't "fix" them:
- Reviews only return with `hl=en`. Swahili reviewers still write in Swahili, so you
  get Swahili text regardless.
- Many apps have far fewer reviews than the store claims. If `reviews_sampled` comes
  back at 20–60, that *is* the whole review base. Say so rather than implying you read
  hundreds.

### 3. Read the evidence yourself

The tally counts keywords; it does not understand them. Open `scan.json` and read the
substantive reviews — the 1–2 star ones over ~60 characters carry nearly all the real
information, and the `quotes` field collects them per signal.

You are looking for what a borrower would want to know:

| What to find | Where it hides in reviews |
|---|---|
| **Riba** (interest/fees) | "nimekopa elfu sita, riba elfu nne", "makato makubwa", percentages |
| **Muda wa kurejesha** | "siku 7", "wiki moja", "muda mfupi" |
| **Kiasi** (amounts) | first-loan size vs later limits — usually rises with repayment history |
| **Approval behaviour** | "approved lakini hela haijaingia", "wamechukua selfie yangu afu wamenikatalia" |
| **Customer support** | "hawajibu", "hawapokei simu", plus the developer reply rate in the data |
| **If you don't pay** | calls to your contacts, threatening SMS, insults, public shaming |
| **Honesty** | promises in the listing vs what reviewers say actually happened |

Quote reviewers in their own words. A specific line like *"nimelipa deni lenu mapema
last week, leo natumiwa sms na kupigiwa simu nadaiwa"* is worth more than any adjective
you could write, and it keeps the review defensible.

### 4. Check whether the rating is real

Loan apps buy 5-star reviews in bulk, so a high star rating is not evidence of anything
until you've looked. The `integrity` block gives you the tell: a wall of very short,
generic 5-star text alongside detailed 1-star complaints.

Read `short_5star_share_of_5star` — above ~0.5 means most positive reviews are one or
two words ("good", "nzuri"), which is what paid review farms produce. When you see that,
say plainly that the rating looks inflated and rank on the substantive reviews instead.
This is often the single most useful thing in the whole review.

### 5. Score and rank

Score each app 0–100 for honesty using `references/scoring.md`. Rank on that score,
not on the Play rating.

**Order the output as a countdown: worst first, best last.** The user is making a
countdown video, so the last app named is the recommendation and gets the most time.
Number them downward (#8, #7 … #1) so #1 lands at the end.

### 6. Write it up

Use the template below. Write in **Swahili**, because the audience is Swahili-speaking
borrowers — but keep the numbers and the app names as they are.

## Output template

```
# App za Mikopo [Month Year]: Nimezipima Zote

**Jinsi nilivyopima:** [n] app, maoni [total] ya watumiaji halisi kutoka Google Play.

---
## NAMBA [n] — [App name]
**Play Store:** [rating]★ ([total_ratings] ratings) · [installs] · [developer]
**Alama ya uaminifu: [score]/100 — [Epuka / Tahadhari / Inakubalika / Nzuri]**

- **Riba:** [what reviewers report, or "Haijulikani — hawaandiki popote"]
- **Muda wa kurejesha:** [...]
- **Kiasi unachoweza kupata:** [first loan → later limit]
- **Wanakubali kwa urahisi?** [approval behaviour]
- **Customer support:** [+ developer reply rate]
- **Ukichelewa kulipa:** [collections behaviour — the most important line]
- **Maoni halisi:** "[direct quote]" — mtumiaji, [n]★

> **Hukumu:** [one or two sentences]
---
[... repeat, counting down ...]

## Jedwali la kulinganisha
| # | App | Uaminifu | Riba | Muda | Ukichelewa | Support |
|---|-----|----------|------|------|------------|---------|

## Ushauri wa mwisho
[3–5 lines: what to check before borrowing from any of them]
```

If the user asks for a spoken script instead of a document, keep the same order and
the same facts, and drop the table.

## Getting this right

**Say "haijulikani" when it's unknown.** Most of these apps never publish their interest
rate. Inventing a plausible number would be the most damaging thing you could do here —
someone may borrow on it. An honest gap is more useful than a confident guess, and it is
itself a finding: an app that hides its riba has told you something.

**Ground every accusation in a quote.** These are real companies. "Reviewers report being
threatened, e.g. [quote]" is fair reporting. "This company threatens people" stated flatly
is not, unless many reviews independently say so — then say "many reviewers report".

**Separate what's proven from what's alleged.** A single angry review is one person's
experience. Fifteen reviews describing the same collections behaviour is a pattern. Weight
them differently and let the reader see which is which.

**A high rating is a claim, not a fact.** Check integrity before repeating it.

**Don't recommend a harmful lender just to have a #1.** If every app scans badly, say so
and make the #1 slot "none of them — here's what to do instead". Ranking is a service to
borrowers, not a favour to lenders. Equally, don't smear an app that scans clean: if the
evidence is thin, the honest line is that there isn't enough of it.

**Note the date.** These apps change terms, get delisted, and get replaced constantly.
Say when the scan was run so the review carries its own expiry.

## Files

- `scripts/playstore.py` — search, app details, reviews, and the `scan` command that
  does all three plus signal tagging. Run `--help` for options.
- `references/scoring.md` — the 0–100 honesty rubric, the Swahili signal glossary, and
  guidance on reading the integrity numbers.
