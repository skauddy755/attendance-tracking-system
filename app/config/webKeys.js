const webKeys = {
    LOCAL: {
        HOST: "localhost",
        PORT: 5000
    },
    USER_ROLES: {
        ADMIN: "ADMIN",
        COMPANY: "COMPANY",
        STUDENT: "STUDENT"
    },
    WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:5000",
    MONGO_URI: (process.env.MONGO_SELECT == 1)
                    ? process.env.HOSTED_MONGO_URI
                    : process.env.CONTAINERIZED_MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,

    HOST: process.env.HOST || "localhost",
    PORT: process.env.PORT || 5000
};

module.exports = webKeys;