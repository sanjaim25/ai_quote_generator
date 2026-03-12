# AI Quote Generator

This project is a Generative AI web application that generates motivational quotes based on user input topics.

## Technologies Used
- Python
- Flask
- Ollama
- LLaMA 3
- HTML, CSS, JavaScript

## How it Works
1. User enters a topic or keyword.
2. Flask backend sends a prompt to the Ollama API.
3. LLaMA 3 generates motivational quotes.
4. Quotes are displayed on the web page.

## How to Run

1. Install dependencies

pip install -r requirements.txt

2. Start Ollama and run the model

ollama run llama3

3. Run the Flask app

python app.py
