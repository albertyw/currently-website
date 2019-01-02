module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "$": true,
        "_": true,
        "Q": true,
        "Rollbar": true,
        "it": true,
        "describe": true,
        "beforeEach": true,
        "chai": true,
        "gapi": true,
        "updateBackgroundColorPeriod": true,
        "updateBackgroundColor": true,
        "AppDate": true
    }
};
