# AI Study Buddy prompt library

AZ-900 Coach is an unofficial learning companion. These prompts are designed for beginner-friendly explanations and original practice content. They are not instructions to retrieve, reconstruct, or imitate real Microsoft exam questions.

## Prompt patterns

### 1. Explain a concept

```text
Explain [AZURE CONCEPT] in simple terms for someone new to cloud computing. Use one everyday analogy, then give one accurate Azure example. End with one sentence describing what it is not.
```

### 2. Compare two services

```text
Compare [SERVICE A] and [SERVICE B] for AZ-900 preparation. Explain purpose, who manages what, a realistic use case, and the clue words that point to each service. Do not use recalled or copied exam questions.
```

### 3. Create original scenarios

```text
Write 5 original AZ-900-style learning scenarios about [TOPIC]. Each should have 4 options, one best answer, a beginner-friendly explanation, and a short note explaining why the strongest distractor is wrong. Do not imitate or reproduce real exam questions.
```

### 4. Give a hint without spoiling

```text
I am deciding between [OPTION A] and [OPTION B] for this scenario: [SCENARIO]. Give me one hint about the deciding concept, but do not reveal the answer yet. Then ask me to choose.
```

### 5. Review a mistake

```text
I chose [MY ANSWER] for this AZ-900 question: [QUESTION]. The correct answer is [CORRECT ANSWER]. Explain my likely misunderstanding in simple terms, contrast the two choices, and give me one new original mini-scenario to check my understanding.
```

### 6. Build a revision sheet

```text
Create a one-page AZ-900 revision sheet for [TOPIC]. Include the core definition, 5 key services or terms, 3 common comparisons, 3 exam clue phrases, and 5 original self-check questions with answers.
```

### 7. Use a local or African example

```text
Explain [AZURE CONCEPT] using a respectful real-life example from an African context such as a school, clinic, small retailer, mobile-money service, farm cooperative, or public office. Keep the Azure explanation technically accurate and label the analogy as an analogy.
```

### 8. Plan a short study session

```text
I have [MINUTES] minutes and my weak AZ-900 areas are [WEAK AREAS]. Build a focused study session with 3 learning blocks, one hands-on thought exercise, and a 5-question recap. Prioritize understanding over memorization.
```

## Customization guide

Replace bracketed placeholders with the learner’s topic, answer choices, time available, or weak areas. Ask the assistant to use short paragraphs, define unfamiliar acronyms, and explain why distractors are wrong. For governance topics, useful inputs include `Azure Policy vs resource locks`, `tags and cost management`, `Azure Advisor vs Azure Monitor`, and `management groups vs subscriptions`.

## Responsible content guidelines

- Request original learning scenarios rather than real exam questions.
- Do not ask an AI assistant to reproduce recalled questions, dumps, answer keys, or Microsoft exam forms.
- Treat generated explanations as study support and verify important technical details against the public Microsoft Learn skills outline and Azure documentation.
- Do not use Microsoft logos or imply endorsement. Keep the project labeled unofficial.
- Use analogies as teaching aids, not as replacements for accurate definitions.
- Do not include confidential learner information in prompts.
- When using local examples, avoid stereotypes and clearly distinguish the example from the Azure service itself.
