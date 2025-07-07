const path = require('path');
const lowLevelTools = require('../tools');

const defineTools = (agentState) => {
    return {
        writeFile: (args) => lowLevelTools.writeFile(agentState.directory, args.filePath, args.content),
        readFile: (args) => lowLevelTools.readFile(agentState.directory, args.filePath),
        listDir: (args) => lowLevelTools.listDir(agentState.directory, args.path || '.'),
        execCommand: (args) => lowLevelTools.execCommand(agentState.directory, args.command),
        appendlog: async (args) => {
            const readmePath = path.join(agentState.directory, 'log.md');
            try {
                const currentContent = await lowLevelTools.readFile(agentState.directory, 'log.md');
                const newContent = `${currentContent}\n\n---\n\n## Progress Update\n\n${args.content}`;
                await lowLevelTools.writeFile(agentState.directory, 'log.md', newContent);
                return 'log.md updated with progress.';
            } catch (e) {
                await lowLevelTools.writeFile(agentState.directory, 'log.md', args.content);
                return 'log.md created with initial content.';
            }
        }
    };
};

module.exports = { defineTools };