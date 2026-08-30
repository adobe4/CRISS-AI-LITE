# Honesty scoring, signal glossary, and how to read the integrity numbers

## The 0–100 honesty score

Start every app at **100** and subtract. The point of scoring down from a clean slate is
that an app is not guilty because it's a loan app — it loses points for things reviewers
actually describe.

Work out each signal as a **share of reviews that have text**, not a raw count. An app
with 300 reviews will naturally show more of everything than one with 21.

| Deduction | Trigger | Why it's weighted this way |
|---|---|---|
| **−30** | `approved_not_disbursed` above 5% of text reviews | The borrower's data is taken and a loan is shown as sent, but no money arrives. This is the most damaging pattern in the data and often outright fraud. |
| **−25** | `harassment` above 5% | Calls to family, threatening SMS, public shaming. This is the thing that ruins people's lives, and it's the question the audience most wants answered. |
| **−15** | `paid_but_chased` above 3% | Repayments not recorded, borrower chased anyway. Signals broken systems plus aggressive collections. |
| **−15** | `scam_accusation` above 10% | Many independent users calling it theft. High threshold because angry borrowers say this loosely. |
| **−10** | `high_interest` above 5% | Reviewers quoting rates they consider extortionate. |
| **−10** | `refused_after_data` above 8% | Harvests ID and selfie, then declines. Even without a loan, the data is gone. |
| **−10** | Review base looks bought (see below) | Deliberate deception of the person reading the store page. |
| **−8** | `support_bad` above 5%, or developer reply rate is 0 with many complaints | No way to fix a problem once you have one. |
| **−5** | No privacy policy, or a policy on an unrelated domain | Careless or deliberately obscured data handling. |
| **−5** | `data_privacy` above 3% | Contacts, photos, personal data taken beyond need. |
| **−5** | `app_broken` above 10% | Can't repay on time if the app won't open — this compounds into penalties. |
| **+5** | `positive_paid` above 15% **and** low harassment | Many people genuinely served without collections abuse. |
| **+5** | Developer reply rate above 20% | Someone is actually answering. |

Cap at 0 and 100. Then translate:

- **80–100 — Nzuri:** safe enough to name as a first choice, with the usual cautions.
- **60–79 — Inakubalika:** works for most, with real caveats worth stating.
- **40–59 — Tahadhari:** use only if you have no alternative and can repay on time.
- **0–39 — Epuka:** tell people to stay away, and say exactly why.

### Two caps that stop the score lying

**Thin evidence is not a good result.** Percentages computed over 21 reviews are noise —
one angry borrower moves the number five points. Below ~50 text reviews, label the score
*"ushahidi mdogo"* (low confidence) and do not give the app the #1 slot, however well it
scores. An app can look clean simply because almost nobody has reviewed it, and putting
that at #1 sends people to the least-tested lender on the list.

**A rating you can't trust caps the band.** If `short_5star_share_of_5star` is above 0.5,
the positive reviews aren't reliable evidence, so cap the app at **Inakubalika (79)** no
matter what the arithmetic says. You can only prove the absence of complaints when the
review base is real. Say why the cap was applied.

Show the score and the two or three deductions that drove it. A score whose reasoning is
invisible is just an opinion with a number attached; showing the arithmetic is what makes
it something a viewer can check and trust.

## Reading the integrity block

```
five_star_share            share of text reviews that are 5★
short_generic_5star        count of 5★ reviews under 25 characters
short_5star_share_of_5star the ratio that matters
dev_reply_rate             share of reviews the developer answered
low_star_count             1★ and 2★ in the sample
```

**The pattern that gives away a bought review base:** a high star rating, a large pile of
5-star reviews that say "good", "nice", "nzuri" and nothing else, and a smaller set of
long, specific, furious 1-star reviews. Real satisfied users of a loan app usually say
what they got — the amount, how fast it arrived. One-word praise at volume is what review
farms produce.

Rough reading of `short_5star_share_of_5star`:
- under 0.3 — normal
- 0.3 to 0.5 — some padding, mention it
- above 0.5 — treat the rating as unreliable and say so
- above 0.7 — the rating is essentially manufactured

A real example from a live scan: an app with **4.5★** had **120 of 250** sampled reviews
as short generic 5-stars, while its detailed reviews described threatening SMS and loans
approved but never disbursed. The star rating was the least true thing on the page.

## Signal glossary

Swahili phrasing varies a lot by region and by how angry someone is, and reviewers use
heavy abbreviation ("nmejaribu kukop", "hela haiingii", "cjareceive"). Read the quotes
rather than trusting the counter — the regex catches the common forms, not all of them.

| Signal | What reviewers are describing | Typical wording |
|---|---|---|
| `approved_not_disbursed` | Loan marked approved, money never arrives | "approved lakini hela haiingii", "completed order", "hakuna pesa imeingia" |
| `harassment` | Collections abuse | "sms za ajabu", "wanapiga simu ndugu", "matusi", "kunidhalilisha" |
| `paid_but_chased` | Repaid, still pursued | "nimeshalipa lakini nadaiwa" |
| `high_interest` | Riba considered extortionate | "riba pekee ni elfu nne", "makato makubwa", "ni wizi" |
| `short_term` | Repayment window | "siku 7", "wiki moja", "muda mfupi" |
| `refused_after_data` | ID/selfie taken, loan declined | "wamechukua selfie yangu afu wamennyima mkopo" |
| `scam_accusation` | Called fraud outright | "matapeli", "waongo", "wizi", "scam" |
| `support_bad` | No help available | "hawajibu", "hawapokei simu" |
| `fees_hidden` | Undisclosed deductions | "makato", "sikuambiwa", "walikata" |
| `data_privacy` | Data taken beyond need | "contacts zangu", "taarifa zangu" |
| `positive_paid` | Genuinely served | "nimepata mkopo", "imenisaidia" |
| `app_broken` | Won't work | "haifunguki", "inagoma", "app ipo down" |

## Extracting the numbers

`amounts_mentioned`, `days_mentioned` and `percents_mentioned` are *candidates*, not
findings. A number in a review might be a loan size, a repayment, a fee, or a phone
number. Always open the review the number came from before quoting it.

For amounts, the useful shape is usually **first loan → later limit**: these apps start
small (often 5,000–30,000 TZS) and raise the ceiling as you repay. Reviewers describe
this well, and it answers "kiasi gani nitapata?" far better than any listing.

Swahili money words are converted for you: "elfu saba" → 7,000, "laki tatu" → 300,000,
"milioni moja" → 1,000,000.
