const pool = require("../../config/database");

module.exports = {
    saveUser: async (userinfo) => {
        await pool.query(
            `INSERT INTO "user" (name, email, sub) VALUES ($1, $2, $3) 
         ON CONFLICT (sub) DO UPDATE SET name = $1, email = $2`,
            [userinfo.name, userinfo.email, userinfo.sub]
        );
    },

    saveAuthStateDetails: async (state, codeChallenge, code_verifier, nonce, url) => {
        await pool.query(
            'INSERT INTO auth_state (state, code_challenge, code_verifier, nonce, origin_url) VALUES ($1, $2, $3, $4, $5)',
            [state, codeChallenge, code_verifier, nonce, url]
        );
    },
    retrieveAuthStateDetails: async (state) => {
        const result = await pool.query(
            'SELECT * FROM auth_state WHERE state = $1',
            [state]
        );

        return result;
    },

    saveRefreshToken: async (userSub, refreshToken)=>{
        await pool.query(
            `INSERT INTO user_token (user_id, refresh_token, expiration_date)
         VALUES ((SELECT id FROM "user" WHERE sub = $1), $2, NOW() + interval '30 days')`,
        [userSub, refreshToken]
        );
    }
};