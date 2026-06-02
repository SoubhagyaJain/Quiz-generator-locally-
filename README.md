<div align="center">
  <img src="https://img.shields.io/badge/Powered_by-Ollama-white?logo=ollama&style=for-the-badge" alt="Ollama" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white&style=for-the-badge" alt="LangChain" />
  <img src="https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white&style=for-the-badge" alt="Flask" />
  <img src="https://img.shields.io/badge/Pytest-0A9EDC?logo=pytest&logoColor=white&style=for-the-badge" alt="Pytest" />
</div>

<h1 align="center">🧠 Local LLM Quiz Generator</h1>

<p align="center">
  An AI-powered Quiz Generator running entirely on local infrastructure. It features a stunning <strong>Liquid Glass Web UI</strong>, strict <strong>Automated Evaluations</strong>, and robust <strong>Local LLMOps</strong> principles. 
</p>

---

## ✨ Features

- 🪟 **Liquid Glass Web UI**: A stunning, responsive front-end inspired by Apple's iOS Liquid Glass aesthetic. Features animated mesh backgrounds, frosted glass panels, and interactive flash cards.
- ⚡ **Lightning Fast Local LLM**: Powered by `gemma4:latest` via **Ollama**. Runs 100% locally with zero API costs, zero data sharing, and optimized token limits for snappy web responses.
- 🤖 **LangChain Pipeline**: Utilizes `ChatPromptTemplate` and `StrOutputParser` to orchestrate context-aware prompt generation and parsing.
- 🛡️ **Automated Evals (LLMOps)**: A comprehensive `pytest` suite testing both **positive fact retrieval** and **negative refusal guardrails** (rejecting off-topic prompts).
- 📓 **Interactive Notebook**: A permanent, fully configured Jupyter Notebook (`quiz1.ipynb`) complete with dynamic dependency injection and a dedicated `.venv` kernel.

## 🏗️ Architecture

1. **Frontend (`static/`)**: HTML/CSS/JS single-page application. Handles view transitions, category selection, and flash card logic.
2. **Backend Server (`server.py`)**: A Flask REST API that bridges the UI to the LangChain pipeline.
3. **AI Engine (`app.py`)**: Defines the `assistant_chain`, system prompt guardrails, and knowledge bank.
4. **Automated Testing (`test_assistant.py`)**: Validates model generation accuracy against the knowledge bank without human intervention.

## 🚀 Quickstart

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

## 📊 Evaluation & Testing

This project proves that enterprise-grade LLMOps practices can be executed locally. 

- **Positive Testing (`test_science_quiz`, `test_geography_quiz`)**: Asserts that the local model accurately retrieves facts from the internal context bank rather than hallucinating external knowledge.
- **Negative Testing (`test_refusal_rome`)**: Verifies the system prompt guardrails successfully force the model to politely decline out-of-domain requests.

**Test Results:**
```text
test_assistant.py::test_science_quiz    PASSED  [ 33%]
test_assistant.py::test_geography_quiz  PASSED  [ 66%]
test_assistant.py::test_refusal_rome    PASSED  [100%]

======================== 3 passed in 76.88s =========================
```

## 📁 Project Structure

```text
Quiz-generator-locally-/
├── 🌐 static/
│   ├── index.html           # Liquid Glass UI structure
│   ├── styles.css           # UI Design System & Animations
│   └── app.js               # Flash card & API logic
├── 🧠 app.py                # LangChain LLM Pipeline & Knowledge Bank
├── ⚙️ server.py             # Flask Backend Server
├── 🧪 test_assistant.py     # Automated Pytest Suite
├── 📓 quiz1.ipynb           # Development & Experimentation Notebook
└── 📦 requirements.txt      # Python Dependencies
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
