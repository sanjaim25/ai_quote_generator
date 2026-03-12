import requests
from flask import Flask, render_template, request

app = Flask(__name__)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3"   # change if needed


def generate_quotes(topic):
    prompt = f"""
Generate exactly 5 short motivational quotes about {topic}.
Each quote on a new line.
No numbering. No bullets. No explanation.
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 1.1}
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=60)
        r.raise_for_status()
        raw = r.json().get("response", "")
    except Exception:
        return ["Quote generation failed"] * 5

    quotes = []
    for line in raw.split("\n"):
        line = line.strip().lstrip("0123456789.-• ")
        if line:
            quotes.append(line)

    if not quotes:
        quotes = ["No quote generated"] * 5
    elif len(quotes) < 5:
        quotes += [quotes[-1]] * (5 - len(quotes))

    return quotes[:5]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    topic = request.form.get("topic") or "life"
    quotes = generate_quotes(topic)
    return render_template("result.html", topic=topic, quotes=quotes)


if __name__ == "__main__":
    app.run(debug=True)
