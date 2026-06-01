# 🧠 Local LLMOps: Automated Evaluations with Ollama & LangChain

An AI-powered Quiz Generator built to demonstrate robust **Continuous Integration (CI)** and **Automated Evaluations** for Large Language Models, running entirely on local infrastructure.

This project was initially inspired by cloud-dependent LLMOps architectures but was re-engineered to utilize local, open-weights models. It showcases the transition from managed APIs (OpenAI) to local inference (Ollama/Gemma) while maintaining strict evaluation standards.

## 💡 The "Why": My Thought Process

When building agentic workflows and AI applications, relying strictly on cloud providers (like OpenAI) creates dependencies, latency, and costs. I wanted to prove that enterprise-grade LLMOps practices—specifically **automated model-graded evaluations** and **continuous integration**—could be executed locally.

**Core Objectives:**

1. **Privacy & Cost-Efficiency:** Run the entire generation and evaluation pipeline locally without sending data to external APIs.
2. **Robust Guardrails:** Implement and test strict refusal protocols for out-of-domain prompts (Negative Testing).
3. **Pipeline Resilience:** Transition standard cloud-based CI/CD workflows into a local testing paradigm to avoid the classic "localhost in the cloud" trap.

## 🛠️ What I Built (The Architecture)

This project is an automated quiz generator that takes a user's category (e.g., Science, Art, Geography) and generates a 3-question quiz based strictly on an internal context bank.

### Key Technical Implementations:

- **Local Model Swapping:** Completely replaced `ChatOpenAI` (`gpt-3.5-turbo`) with `Ollama` (`gemma4:latest`) within the LangChain pipeline.
- **Prompt Engineering & Guardrails:** Configured the `SystemMessage` with strict instructions to refuse off-topic questions.
- **Automated Evals (PyTest):** 
  - *Positive Testing:* Verifying the model accurately retrieves facts from the provided context (`eval_expected_words`).
  - *Negative Testing:* Asserting that the model successfully refuses unanswerable prompts (e.g., "Generate a quiz about Rome") with a polite decline rather than hallucinating (`evaluate_refusal`).
- **CI/CD Configuration:** Wired the repository for CircleCI.

## 🚧 Engineering Challenges Overcome

The biggest hurdle in this project was bridging the gap between cloud-based Continuous Integration and local model hosting.

When pushing the automated tests to **CircleCI**, the cloud runners immediately failed. Why? Because the cloud server was attempting to reach `localhost:11434` (Ollama) within its own empty virtual machine, rather than my physical hardware.

**The Solution:** Instead of defaulting back to paid cloud APIs just to appease the CI/CD dashboard, I decoupled the test runner. I utilized CircleCI for code validation and configuration, but successfully executed the actual LLM evaluations locally via `pytest`, achieving a 100% pass rate with my local Gemma model. This highlighted the architectural difference between code-level CI and model-level CI.

## 💻 Tech Stack

- **Framework:** LangChain (`ChatPromptTemplate`, `StrOutputParser`)
- **LLM Engine:** Ollama (Gemma)
- **Testing:** PyTest (Automated Assertion Evals)
- **CI/CD:** GitHub Actions / CircleCI Config
- **Language:** Python 3.11

## 🚀 Quickstart: Run it Locally

### 1. Clone the repository:

```bash
git clone https://github.com/SoubhagyaJain/Quiz-generator-locally-.git
cd Quiz-generator-locally-
```

### 2. Install dependencies:

Ensure you have LangChain, PyTest, and the community integrations installed.

```bash
pip install langchain langchain-community langchain-core pytest
```

### 3. Start your local model:

Make sure Ollama is running in your background with the Gemma model.

```bash
ollama run gemma4:latest
```

### 4. Run the Automated Evals:

```bash
pytest test_assistant.py -v
```

*Watch the tests interact with your local model and pass!*

## 📊 Test Results

All automated evaluation tests pass with 100% success rate:

- ✅ `test_science_quiz` - Generates quizzes with correct scientific facts
- ✅ `test_geography_quiz` - Generates quizzes with correct geographic facts
- ✅ `test_refusal_rome` - Successfully refuses out-of-domain prompts

```
============================= test session starts ==============================
platform win32 -- Python 3.11.9, pytest-8.3.4, pluggy-1.6.0
collected 3 items

test_assistant.py . . .                                           [100%]

================== 3 passed in 129.03s (0:02:09) ===================
```

## 📁 Project Structure

```
Quiz-generator-locally-/
├── quiz1.ipynb              # Interactive development notebook
├── app.py                   # Core quiz generator application
├── test_assistant.py        # Automated evaluation tests
├── .circleci/
│   └── config.yml          # CircleCI pipeline configuration
├── README.md               # This file
└── .venv/                  # Virtual environment
```

## 🔧 Configuration

### Environment Variables

- `GITHUB_TOKEN` - Required for pushing code to GitHub (if using automated workflows)
- `CIRCLE_TOKEN` - Required for triggering CircleCI pipelines (optional)

### Model Parameters

The project uses the following Ollama configuration:
- **Model:** `gemma4:latest`
- **Temperature:** `0` (deterministic output for consistent evaluation)
- **Base URL:** `http://localhost:11434` (default Ollama endpoint)

## 📝 Key Components

### `app.py` - Quiz Generator Engine
Implements the core LangChain pipeline with:
- Quiz bank database (Science, Geography, History, Art, Technology)
- Ollama LLM integration
- SystemMessage with guardrails
- Composable chain architecture using LangChain operators

### `test_assistant.py` - Automated Evaluations
Pytest-based test suite featuring:
- Positive testing: Verifying fact retrieval accuracy
- Negative testing: Confirming refusal behavior
- Word-based assertions for quiz validation

## 🎯 Design Decisions

1. **Local-First Architecture:** Prioritized privacy and cost-efficiency over cloud convenience
2. **Deterministic Evaluation:** Set temperature to 0 for reproducible test results
3. **Mutable Defaults Prevention:** Used `None` pattern for function defaults to avoid Python pitfalls
4. **Decoupled CI/CD:** Separated code validation (CircleCI) from model evaluation (local pytest)

## 🔗 Resources

- [Ollama Documentation](https://ollama.ai)
- [LangChain Documentation](https://python.langchain.com)
- [Gemma Model Card](https://huggingface.co/google/gemma)
- [PyTest Documentation](https://docs.pytest.org)

## 📄 License

MIT License - Feel free to use this project for your own explorations!

## 👤 Author

**Soubhagya Jain**

---

**Last Updated:** June 1, 2026

Feel free to open issues or submit pull requests for improvements!
