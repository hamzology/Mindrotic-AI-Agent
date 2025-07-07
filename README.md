# Mindrotic-AI-Agent

**Mindrotic-AI-Agent** is a lightweight, modular Node.js-based AI agent built for educational purposes. Designed with simplicity and clarity in mind, it helps beginners understand how AI agents function and how they can be customized to automate tasks. Whether you're experimenting or building your own assistant, this project offers a clean and hackable foundation to get started.

---

## 🧠 Project Purpose

This project is intended solely for **educational use** aimed at beginners. It serves as a **hands-on learning tool** to explore AI agents, prompt execution, planning logic, and basic tool integration in a local development environment.

---

## ⚙️ Server Setup

Follow these steps to set up the project:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hamzology/Mindrotic-AI-Agent.git
   cd Mindrotic-AI-Agent
   ```
2. **Install the dependencies**:
   ```bash
   npm install
   ```
3. **Create a .env file from the example**:
   ```bash
   cp .env.example .env
   ```
Update the environment variables inside .env as needed.


## Running the Server

To start the server, run:
```bash
npm start
```
The server will be running at `http://localhost:3000`.

## Interacting with the AI Agent

Once the server is running, open your browser and go to `http://localhost:3000`. Here’s how to use the web interface:
- **Working Directory**: Path to the folder where tasks will be executed.
- **Task Prompt**: Description of the task you want the AI to perform.

After submitting the form, wait for the AI agent to analyze the task. The agent will provide a summary and a plan that you can review before execution. You can confirm the execution of the plan, and the agent will display logs and results in real time.

✨ Note: The quality of results depends on the LLM (Large Language Model) API you use. This project was tested with the DeepSeek API in a Linux environment and delivered promising outcomes.
