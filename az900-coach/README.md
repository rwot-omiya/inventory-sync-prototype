# AZ-900 Coach

AZ-900 Coach is an **unofficial** beginner-friendly quiz web app for Microsoft Azure Fundamentals preparation. It was created for a hackathon challenge about turning a learner’s own study journey into a tool that helps the next learner.

The app focuses on original scenario-based questions, instant feedback, and plain-language explanations. It gives extra attention to Azure management and governance, where closely related services such as Azure Policy, resource locks, Advisor, Monitor, tags, and Azure Arc can be easy to confuse.

> **Important:** This project is not affiliated with, endorsed by, or sponsored by Microsoft. It does not use Microsoft logos and does not reproduce real Microsoft exam questions.

## What is included

- Topic-based practice for cloud concepts, Azure architecture and services, Azure management and governance, identity and security, and storage.
- Original multiple-choice scenarios with immediate correct/incorrect feedback.
- Beginner-friendly explanations that also explain why the most likely distractor is wrong.
- Local progress tracking in the browser using `localStorage`.
- A governance quick glossary and comparison guidance.
- An AI Study Buddy prompt library for explanations, comparisons, hints, corrections, revision sheets, local examples, and study planning.
- A public Microsoft Learn link to the AZ-900 skills outline for verification.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

The app is intentionally dependency-light. The server is a small Node.js static server and the frontend uses plain HTML, CSS, and JavaScript.

## Project structure

```text
.
├── index.html          # App shell and accessible page structure
├── styles.css          # Responsive visual system
├── app.js              # Question bank, quiz logic, progress, and prompt cards
├── prompts.md          # Reusable AI Study Buddy prompt patterns and safeguards
├── server.mjs          # Local / Preview static server
├── manus-routes.json   # Managed Preview route declaration
├── app.config.ts       # Project logo metadata
└── TODO.md             # Confirmed delivery outcomes
```

## Content safeguards

The question bank is authored as fresh learning content. It is not copied from any real Microsoft assessment. The app avoids test dumps, leaked questions, answer keys, Microsoft logos, or claims of official status.

The AI Study Buddy prompts deliberately ask for original scenarios and explanations. When generated content is used, learners should verify technical details against the public [AZ-900 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900) and Azure documentation.

## Hackathon usage

The app can be demonstrated as a Practice & Assessment tool, with the AI Study Buddy prompt library supporting the Support and Revision parts of the challenge. A short demo flow is:

1. Start a quick round.
2. Answer a governance question and show instant feedback.
3. Switch to the governance topic and show the targeted learning path.
4. Open Study Buddy and copy the “Compare” or “Review my mistake” prompt.
5. Explain how the browser-only progress snapshot helps a learner decide what to revise next.

## Extension ideas

- Add a spaced-repetition queue for questions answered incorrectly.
- Add import/export of progress as a small JSON file.
- Add more original questions mapped to every public skills-outline bullet.
- Add an optional LLM-backed chat experience through a server-side provider integration. Keep API credentials server-side and retain the content safeguards in `prompts.md`.

## License

Add the license chosen by the hackathon team before public distribution. The content and code should remain clearly labeled as an unofficial learning aid.
