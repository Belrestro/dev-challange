const {
    MONGO_DB_PORT = 27017,
    MONGO_DB_HOST = '127.0.0.1',
    DB_NAME = 'command-center',
    REDIS_HOST = '127.0.0.1',
    REDIS_PORT = 6379
} = process.env;

export default {
    MONGO_DB_HOST,
    MONGO_DB_PORT,
    DB_NAME,
    REDIS_HOST,
    REDIS_PORT,
    GATES_INDEX         : 'gates',
    STARSHIP_INDEX      : 'fleet',
    FLEET_COORDINATORS  : 'coordinators',
    STARSHIP_LOG_INDEX   : 'sh-logs',
    CC_LOG_INDEX        : 'cc-logs',
    FILE_FOLDER         : 'files',
    REDIS_SECTOR_PREFIX : 'sector',
}