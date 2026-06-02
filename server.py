"""
Flask server for the Quiz Generator Web UI.
Wraps the existing assistant_chain() to serve quizzes via a REST API.
Uses a token-limited LLM for snappy web responses.
"""

from flask import Flask, request, jsonify, send_from_directory
from langchain_ollama import OllamaLLM
from app import assistant_chain, system_message

app = Flask(__name__, static_folder="static")

import os

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

# ── Faster LLM: cap output tokens so responses arrive quickly ──
fast_llm = OllamaLLM(
    model="gemma4:latest",
    temperature=0,
    base_url=OLLAMA_BASE_URL,
)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)


@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    """Generate a quiz for the given category using the local Ollama model."""
    data = request.get_json()
    category = data.get("category", "")

    if not category:
        return jsonify({"error": "Category is required"}), 400

    try:
        chain = assistant_chain(llm=fast_llm)
        question = f"Generate a quiz about {category}."
        answer = chain.invoke({"question": question})

        questions = _parse_quiz(answer)

        return jsonify({
            "raw": answer,
            "questions": questions,
            "category": category,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def _parse_quiz(raw_response: str) -> list[str]:
    """
    Extract individual questions from the model's ####-delimited response.
    """
    questions = []
    lines = raw_response.split("\n")
    current_q = []

    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("question") and "####" in stripped:
            if current_q:
                questions.append(" ".join(current_q).strip())
                current_q = []
            parts = stripped.split("####")
            remainder = parts[-1].strip()
            if remainder:
                current_q.append(remainder)
        elif current_q and stripped:
            if stripped.lower().startswith("step") or stripped.startswith("####"):
                continue
            current_q.append(stripped)

    if current_q:
        questions.append(" ".join(current_q).strip())

    if not questions:
        for segment in raw_response.split("Question"):
            segment = segment.strip()
            if segment and any(c.isalpha() for c in segment):
                cleaned = segment.lstrip("0123456789.:# ").strip()
                if cleaned:
                    questions.append(cleaned)

    return questions


if __name__ == "__main__":
    print("\n  [*] Quiz Generator is running at http://localhost:5000\n")
    app.run(debug=True, port=5000, host="0.0.0.0")
