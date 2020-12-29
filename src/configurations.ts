export const redisHost = process.env.REDIS_HOST || null;
export const redisPort = (() => {
    try {
        return process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT) : null;
    } catch (error) {
        return null
    }
})();
