//https://reqbin.com/oxvlr1ug
const getPlannerPrompt = (userPrompt, fileStructure, readmeContent) => {
    return `### OBJECTIVE ###
Your task is to interpret the user's request and the provided project context, then generate a high-level development plan in a structured JSON format.

### CONTEXT ###
1. User's Request:
${userPrompt}


2. Project Files & Content:
${fileStructure || 'The project directory is currently empty. This is a new project.'}


### INSTRUCTIONS & CONSTRAINTS ###
${fileStructure ? '### For Existing Projects:\n1.  **Analyze**: Review the existing file structure and content to understand the current state of the project.\n2.  **Identify Gaps**: Based on the user\'s request, determine what components are missing or need modification.\n3.  **Plan**: Generate a development plan that builds upon or modifies the existing structure.\n4.  **Summarize**: Create a concise project summary and provide instructions to run the project after your plan is implemented.' : '### For New Projects:\n1.  **Understand**: Clearly grasp the user\'s goal for this new application.\n2.  **Summarize**: Define the project\'s purpose in a single, clear sentence.\n3.  **Plan**: Break down the development process into logical, high-level steps. Each step should represent a single, actionable goal for the implementation phase (e.g., "Set up project structure and dependencies", "Create the main server file", "Build the initial HTML structure").\n4.  **Run Instructions**: Specify the basic commands needed to run the project once completed.'}


### General Rules ###
-   **No Code:** Your output must NOT contain any implementation code, code snippets, or file paths.
-   **Focus on the What, not the How:** The plan should describe goals (e.g., "Create a POST endpoint for user registration"), not implementation details.
-   **No Testing Steps:** Do not include steps for unit tests, integration tests, or creating test files unless the user's primary request is specifically about testing.
-   **Atomic Steps:** Each step in the "plan" array should be a distinct, self-contained task.
-   **Adherence:** Strictly follow the user's request. Do not add features or steps not directly implied by the request.

# EXAMPLE
### User Request Example: "Create a simple Express.js server that returns 'Hello World!'"
### Expected JSON Output Example:
{
  "summary": "A simple Node.js application using the Express.js framework to serve a 'Hello World!' message.",
  "plan": [
    "Create a main server file (e.g., index.js) to set up the Express application",
    "Implement a single GET endpoint at the root path ('/') that responds with 'Hello World!'",
    "Configure the server to listen on a specified port"
  ],
  "run_instructions": "npm install && node index.js"
}

# RESPONSE FORMAT
Your final response MUST be a single, valid JSON object. Do not include any text or explanations outside of the JSON.

{
  "summary": "A one-sentence summary that captures the project goal.",
  "plan": [
    "Plan Text 1",
    "Plan Text 2"
  ],
  "run_instructions": "A simple guide on how to run the final project."
}`;
};

const getExecutionPrompt = (userPrompt, phase, fileStructure, history) => {
    return `### OBJECTIVE ###
Your goal is to complete the "Current Task (Phase)" by generating the correct sequence of tool calls.

### CONTEXT ###
- # Original User Request:
 ${userPrompt}

- # Current Task (Phase):
 ${phase}

- # Project Files & Content:
  ${fileStructure || 'The project directory is currently empty. This is a new project.'}

- # History of Completed Phases:
  ${history || 'No actions taken yet.'}

### AVAILABLE TOOLS ###
You have access to the following tools. You must respond with tool calls in the specified JSON format.

1.  "readFile": Reads the entire content of a file.
    -   Arguments: { "filePath": "path/to/filename.ext" }
2.  "writeFile": Creates a new file or completely overwrites an existing one.
    -   Arguments: { "filePath": "path/to/filename.ext", "content": "Full file content" }
    -   ⚠️ CAUTION: This REPLACES the file. If you are modifying a file, you MUST use "Project Files & Content" Context of that file and include the unchanged parts in your new "content".
    -   If the "filePath" includes directories that do not exist, they will be created automatically.
3.  "appendlog": Appends a log entry to the history for the next phase.
    -   Arguments: { "content": "A concise, first-person log of what was accomplished (e.g., 'I created the package.json and added the express dependency.')." }
    -   This should be the FINAL tool call in your response.

### INSTRUCTIONS & CONSTRAINTS ###
-   **Focus:** Your actions must ONLY address the "Current Task (Phase)". Do not perform work for future phases.
-   **Completeness:** All generated code within 'writeFile' must be complete, syntactically correct, and production-ready. Do not use placeholders like '// ...'.
-   **Efficiency:** Use the minimum number of tool calls necessary to complete the task.
-   **Logging:** You MUST conclude your work with a single 'appendlog' call summarizing what you did in this phase. This log is critical for maintaining continuity.

### EXAMPLE ###
# Current Task (Phase) Example: "Initialize a new Node.js project and install the Express.js dependency"
# Expected JSON Output Example:
{
  "thought": "To complete this phase, I need to create a 'package.json' file. I will define the basic project information and add 'express' to the dependencies section so that a later 'npm install' command will work correctly. Finally, I will log that I have completed this setup step.",
  "tools": [
    {
      "tool": "writeFile",
      "arguments": {
        "filePath": "package.json",
        "content": "{\n  \"name\": \"new-project\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"start\": \"node index.js\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\",\n  \"dependencies\": {\n    \"express\": \"^4.18.2\"\n  }\n}"
      }
    },
    {
      "tool": "appendlog",
      "arguments": {
        "content": "I created the package.json file and added the express dependency, preparing the project for the server implementation."
      }
    }
  ]
}

# RESPONSE FORMAT
Your response MUST be a single, valid JSON object. Do not include any text or explanations outside of the JSON object.

{
  "thought": "Your step-by-step reasoning for the tool calls you are about to make.",
  "tools": [
    {
      "tool": "tool_name",
      "arguments": { "arg1": "value1", ... }
    }
  ]
}`;
};

module.exports = { getPlannerPrompt, getExecutionPrompt };