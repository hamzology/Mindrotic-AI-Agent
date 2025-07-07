const { OpenAI } = require('openai');
const lowLevelTools = require('../tools');
const { getPlannerPrompt, getExecutionPrompt } = require('./prompts');
const { defineTools } = require('./tool-definitions');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE,
});

let agentState = {}; // Session state

const analyzeTask = async (req, res) => {
    const { directory, prompt } = req.body;
    if (!directory || !prompt) {
        return res.status(400).json({ error: 'Directory and prompt are required.' });
    }

    try {
        //const dirContents = await lowLevelTools.listDir(directory).catch(() => []);
		
		const ProjectMarkdown = await lowLevelTools.ProjectMarkdown(directory);
		
        const readmeContent = await lowLevelTools.readFile(directory, 'README.md').catch(() => '');

        agentState = {
            directory,
            prompt,
            history: [],
            plan: [],
            run_instructions: '',
        };

        const plannerPrompt = getPlannerPrompt(prompt, ProjectMarkdown, readmeContent);
        const toolFunctions = defineTools(agentState);

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_API_MODEL,
            messages: [{ role: "system", content: "You are a world-class Senior Software Architect. Your expertise is in analyzing user requirements and creating clear, logical, and high-level project roadmaps. You do not write code. Your sole purpose is to create a structured plan." },
					   { role: "user", content: plannerPrompt }],
            response_format: { type: "json_object" },
        });
			const toolFunc = toolFunctions["appendlog"];
			await toolFunc({ content: plannerPrompt });
			await toolFunc({ content: JSON.stringify(response) });

        const planData = JSON.parse(response.choices[0].message.content);
        const clientPlan = planData.plan.map(step => ({ description: step, tool: 'phase' }));

        agentState.plan = planData.plan;
        agentState.run_instructions = planData.run_instructions;

        res.json({
            summary: planData.summary,
            plan: clientPlan,
            run_instructions: planData.run_instructions
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
};

const executePlan = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    const toolFunctions = defineTools(agentState);

    try {
        for (const phase of agentState.plan) {
            sendEvent({ type: 'log', message: `[PHASE] Starting: ${phase}`, class: 'log-agent' });

            const ProjectMarkdown = await lowLevelTools.ProjectMarkdown(agentState.directory);
            const executionPrompt = getExecutionPrompt(agentState.prompt, phase, ProjectMarkdown, agentState.history.join('\n'));
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_API_MODEL,
                messages: [{ role: "system", content: "You are an autonomous AI software developer. Your sole responsibility is to execute a specific development task using the provided tools. You are precise, efficient, and pay close attention to detail." },
						   { role: "user", content: executionPrompt }],
                response_format: { type: "json_object" },
            });
			const toolFunc = toolFunctions["appendlog"];
			await toolFunc({ content: "executionPrompt" });
			await toolFunc({ content: executionPrompt });
			await toolFunc({ content: "response" });
			await toolFunc({ content: JSON.stringify(response) });
			
            const executionData = JSON.parse(response.choices[0].message.content);
            sendEvent({ type: 'log', message: `  -> [AI] ${executionData.thought}`, class: 'log-tool' });

            for (const step of executionData.tools) {
                try {
                    const toolFunc = toolFunctions[step.tool];
                    if (!toolFunc) throw new Error(`Tool "${step.tool}" not found.`);
                    sendEvent({ type: 'log', message: `    [EXEC] ${step.tool}`, class: 'log-tool' });
                    await toolFunc(step.arguments);
                    if (step.tool == 'appendlog') {
                        agentState.history.push(`- Completed: ${phase} -> ${step.arguments.content}`);
                    }
                } catch (toolError) {
                    sendEvent({ type: 'log', message: `    [ERROR] ${toolError.message}`, class: 'log-error' });
                    agentState.history.push(`- FAILED: ${phase} -> ${step.tool} with error: ${toolError.message}`);
                }
            }
        }
        sendEvent({ type: 'complete', message: 'All phases completed.' });
    } catch (e) {
        console.error("Agent loop error:", e);
        sendEvent({ type: 'error', message: e.message });
    } finally {
        res.end();
    }
};

module.exports = { analyzeTask, executePlan };