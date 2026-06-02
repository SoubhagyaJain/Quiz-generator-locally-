<div align="center">
  <img src="https://img.shields.io/badge/Powered_by-Ollama-white?logo=ollama&style=for-the-badge" alt="Ollama" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white&style=for-the-badge" alt="LangChain" />
  <img src="https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white&style=for-the-badge" alt="Flask" />
  <img src="https://img.shields.io/badge/Pytest-0A9EDC?logo=pytest&logoColor=white&style=for-the-badge" alt="Pytest" />
</div>

<h1 align="center">🧠 Local LLMOps Quiz Generator</h1>

<p align="center">
  An AI-powered Quiz Generator running entirely on local infrastructure. It features a stunning <strong>Liquid Glass Web UI</strong>, strict <strong>Automated Evaluations</strong>, and robust <strong>Local LLMOps</strong> principles.
</p>

---

## 📖 What It Does

This project is an automated quiz generator that takes a user's chosen category (Science, Art, or Geography) and generates a 3-question quiz based *strictly* on an internal context bank. 

It acts as a complete end-to-end AI application:
- **Web UI:** A sleek, interactive web interface where users can select categories and view generated quizzes as flash cards.
- **AI Backend:** A local LLM pipeline that parses the request, fetches the right facts from a knowledge bank, and generates the questions.
- **Safety Guardrails:** Strict prompt engineering to ensure the model *refuses* to answer questions about topics not in its database (e.g., if you ask for a History quiz, it politely declines rather than hallucinating).

## 💡 The "Why": My Thought Process

When building agentic workflows and AI applications, relying strictly on cloud providers (like OpenAI) creates dependencies, latency, and recurring costs. 

I built this project to prove that enterprise-grade **LLMOps practices**—specifically **automated model-graded evaluations** and **continuous integration**—could be executed locally on personal hardware without sacrificing quality.

**My Core Objectives:**
1. **Privacy & Cost-Efficiency:** Run the entire generation and evaluation pipeline locally (using open-weight models like Gemma) without sending a single byte of data to external APIs.
2. **Robust Guardrails:** Implement and test strict refusal protocols for out-of-domain prompts (Negative Testing) to prevent hallucinations.
3. **Pipeline Resilience:** Transition standard cloud-based CI/CD workflows into a local testing paradigm to avoid the classic "localhost in the cloud" trap.

## 🎓 What I Learned & Challenges Overcome

The biggest engineering hurdle in this project was **bridging the gap between cloud-based Continuous Integration and local model hosting.**

When pushing automated tests to cloud runners (like CircleCI or GitHub Actions), the cloud server would immediately fail. Why? Because the cloud VM was attempting to reach `localhost:11434` (Ollama) within its own empty environment, rather than my physical hardware where the model actually lived.

**The Solution & Learning:**
Instead of defaulting back to paid cloud APIs just to appease a CI/CD dashboard, I decoupled the test runner. I learned the critical architectural difference between **code-level CI** and **model-level CI**. I utilized cloud CI for static code validation and configuration, but successfully executed the actual LLM evaluations locally via `pytest`. Achieving a 100% pass rate with my local Gemma model proved that rigorous AI testing doesn't strictly require the cloud.

## ✨ Technical Features

- 🪟 **Liquid Glass Web UI**: A stunning, responsive front-end inspired by Apple's iOS Liquid Glass aesthetic. Features animated mesh backgrounds, frosted glass panels, and interactive flash cards.
- ⚡ **Lightning Fast Local LLM**: Powered by `gemma4:latest` via **Ollama**. Runs 100% locally with optimized token limits (`num_predict`) for snappy web responses.
- 🤖 **LangChain Pipeline**: Utilizes `ChatPromptTemplate` and `StrOutputParser` to orchestrate context-aware prompt generation.
- 🛡️ **Automated Evals (LLMOps)**: A comprehensive `pytest` suite testing both **positive fact retrieval** and **negative refusal guardrails**.
- 📓 **Interactive Notebook**: A permanent, fully configured Jupyter Notebook (`quiz1.ipynb`) complete with dynamic dependency injection and a dedicated `.venv` kernel.

## 🏗️ Architecture

1. **Frontend (`static/`)**: HTML/CSS/JS single-page application. Handles view transitions, category selection, and flash card logic.
2. **Backend Server (`server.py`)**: A Flask REST API that bridges the UI to the LangChain pipeline.
3. **AI Engine (`app.py`)**: Defines the `assistant_chain`, system prompt guardrails, and knowledge bank.
4. **Automated Testing (`test_assistant.py`)**: Validates model generation accuracy without human intervention.

## 🚀 Quickstart: Run it Locally

### 1. Clone & Setup
```bash
git clone https://github.com/SoubhagyaJain/Quiz-generator-locally-.git
cd Quiz-generator-locally-

# Create a virtual environment and activate it
python -m venv .venv
source .venv/Scripts/activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Local Model
Ensure [Ollama](https://ollama.ai/) is installed and running, then pull the model:
```bash
ollama run gemma4:latest
```

### 3. Launch the Web UI
```bash
python server.py
```
*Open your browser and navigate to **http://localhost:5000** to experience the Liquid Glass UI.*

### 4. Run the Automated Evaluations
```bash
pytest test_assistant.py -v
```

## 📊 Evaluation Results

- ✅ `test_science_quiz` - Generates quizzes with correct scientific facts
- ✅ `test_geography_quiz` - Generates quizzes with correct geographic facts
- ✅ `test_refusal_rome` - Successfully refuses out-of-domain prompts

```text
test_assistant.py::test_science_quiz    PASSED  [ 33%]
test_assistant.py::test_geography_quiz  PASSED  [ 66%]
test_assistant.py::test_refusal_rome    PASSED  [100%]

======================== 3 passed in 76.88s =========================
```

## 💻 Tech Stack
- **AI/LLM**: [Ollama](https://ollama.ai), Gemma, [LangChain](https://python.langchain.com/)
- **Backend**: Python 3.11+, Flask
- **Frontend**: Vanilla HTML5, CSS3 (Liquid Glass CSS), JavaScript
- **Testing & Ops**: PyTest, CircleCI

## 👤 Author
**Soubhagya Jain**

Feel free to open issues or submit pull requests for improvements!

*Last Updated: June 2026*
