const express = require("express");
const bodyP = require("body-parser");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(bodyP.json());

// Serve your CodeMirror and static files
app.use("/codemirror/codemirror-5.65.17", express.static("E:/Festival_2024/codemirror/codemirror-5.65.17"));

app.get("/", function (req, res) {
    res.sendFile("E:/Festival_2024/index.html");
});

// Route to compile and execute code using the Piston API
app.post("/compile", async function (req, res) {
    const { code, input, lang } = req.body;

    // Map the language from your UI to the Piston API supported languages
    const languageMap = {
        "Cpp": "cpp",
        "Java": "java",
        "Python": "python3"
    };

    const selectedLanguage = languageMap[lang];

    if (!selectedLanguage) {
        return res.status(400).json({ error: "Unsupported language" });
    }

    // Piston API request payload
    const payload = {
        language: selectedLanguage,
        version: "*", // Use the latest available version for the language
        files: [
            {
                name: `main.${selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}`,
                content: code
            }
        ],
        stdin: input || "" // Input for the program, empty if not provided
    };

    try {
        // Make POST request to Piston API
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", payload);

        // Send back the output (stdout or stderr)
        const output = response.data.run.stdout || response.data.run.stderr;
        res.json({ output });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to compile and run the code" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
