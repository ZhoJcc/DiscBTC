const sessions = new Map();

module.exports = {
    createSession: (discordId) => {
        const sessionId = `${discordId}-${Date.now()}`;
        sessions.set(discordId, { sessionId, timestamp: Date.now() });
        return sessionId;
    },
    getSession: (discordId) => sessions.get(discordId),
    endSession: (discordId) => sessions.delete(discordId),
};
