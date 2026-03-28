# GENIE.exe

![GENIE.exe Logo](https://raw.githubusercontent.com/instai4/GENIE.exe/main/public/logo.png) <!-- Assuming a logo.png in public folder for a webapp -->

A dark NeoBrutalist AI mind reader that guesses any person, character or animal using multi-provider AI (Grok / Groq / Gemini fallback).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://genie-exe.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/instai4)

## 🚀 Technologies Used

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Grok API](https://img.shields.io/badge/Grok%20API-000000?style=for-the-badge&logo=xai&logoColor=white)
![Groq API](https://img.shields.io/badge/Groq%20API-000000?style=for-the-badge&logo=groq&logoColor=white)
![Gemini API](https://img.shields.io/badge/Gemini%20API-000000?style=for-the-badge&logo=google-gemini&logoColor=white)
![Font Awesome 6](https://img.shields.io/badge/Font%20Awesome%206-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white)

---

## 📖 About The Project

GENIE.exe is an innovative web application designed to challenge and entertain users by reading their minds. Leveraging cutting-edge multi-provider AI, it attempts to guess any person, character, or animal a user might be thinking of. The application features a distinctive NeoBrutalist dark UI, providing a unique and engaging user experience. With its robust AI fallback system, GENIE.exe promises an uninterrupted and highly accurate mind-reading session every time.

---

## ✨ Key Features

*   **AI Mind Reader**: Accurately guesses any person, character, or animal.
*   **Multi-Provider Fallback**: Seamlessly switches between Grok, Groq, and Gemini APIs, ensuring continuous operation and preventing failures.
*   **Unlimited Questions**: The Genie continues asking questions until it confidently identifies the subject.
*   **95% Confidence Threshold**: Guesses are only made once the AI reaches a high level of certainty.
*   **Custom Shattered G Logo**: Features a unique abstract geometric logo, enhancing brand identity.
*   **NeoBrutalist Dark UI**: A modern, dark user interface with custom cursor and subtle animations for an immersive experience.
*   **Question History Log**: Keeps track of all questions asked and user answers (Yes / No / Probably / Don't Know).
*   **Diverse Categories**: Choose from 6 distinct categories: Real People, Fictional, Anime, Games, Animals, and Movie/TV.
*   **Font Awesome Icons**: Utilizes a comprehensive set of Font Awesome 6 icons for a clean, emoji-free aesthetic.
*   **Dynamic Genie Avatar**: A floating avatar with a pulse ring, indicating its thinking process, and distinct win/lose states.

---

## 💡 How To Use

1.  **Think of a Subject**: Mentally choose any real person, fictional character, anime character, game character, animal, or movie/TV character.
2.  **Select Categories**: On the GENIE.exe interface, select the relevant categories for your chosen subject.
3.  **Initiate Mind Read**: Click the "Read My Mind" button to begin the game.
4.  **Answer Honestly**: Respond to each yes/no question posed by the Genie truthfully.
5.  **Genie Guesses**: The Genie will continue to ask questions until it achieves 95% confidence and makes its guess.
6.  **Confirm or Deny**:
    *   If the Genie's guess is correct, answer "Yes."
    *   If the guess is incorrect, answer "No," and the Genie will continue asking questions.

---

## ⚙️ Installation

To set up GENIE.exe locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/instai4/GENIE.exe.git
    cd GENIE.exe
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your API keys:
    ```
    GROK_API_KEY=your_grok_api_key
    GROQ_API_KEY=your_groq_api_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
    *Note: Obtain your API keys from the respective AI providers (xAI for Grok, Groq Cloud for Groq, Google Cloud for Gemini).*

4.  **Run the Application**:
    ```bash
    npm start
    ```
    The application will typically be accessible at `http://localhost:3000` in your web browser.

---

## 🛠️ Tech Stack

The following technologies and tools were used in the development of GENIE.exe:

*   **Frontend**:
    *   HTML5
    *   CSS3
    *   JavaScript
    *   Font Awesome 6 (for icons)
*   **Backend**:
    *   Node.js
    *   Vercel Serverless Functions (for API routing and logic)
*   **AI Integration**:
    *   Grok API (xAI)
    *   Groq API
    *   Gemini API (Google)
*   **Version Control**:
    *   Git

---

## 👤 Author

**Anurag Rajput**

A dedicated B.Tech Data Science Student passionate about AI and web development.

*   **Role**: B.Tech Data Science Student @ Dev Bhoomi Uttarakhand University (DBUU)
*   **Portfolio**: [https://instai4.github.io/PORT-FOLIO/](https://instai4.github.io/PORT-FOLIO/)
*   **LinkedIn**: [https://www.linkedin.com/in/anurag-singh-43230a380/](https://www.linkedin.com/in/anurag-singh-43230a380/)
*   **GitHub**: [https://github.com/instai4](https://github.com/instai4)

---

## 🔮 Future Enhancements

We envision the following features and improvements for GENIE.exe:

*   **User Accounts & History**: Implement user authentication to save game history and preferences.
*   **Custom Categories**: Allow users to define and play with their own categories.
*   **Voice Input/Output**: Integrate speech-to-text and text-to-speech for a more interactive experience.
*   **Multi-language Support**: Expand accessibility by supporting multiple languages.
*   **Advanced AI Prompting**: Refine AI prompts for even more nuanced and intelligent questioning.
*   **Leaderboards**: Introduce leaderboards for tracking best scores or fastest guesses.

---

## 🤝 Contributing

Contributions are highly welcome! If you have suggestions for improvements, new features, or bug fixes, please follow these steps:

1.  **Fork** the repository.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Make your changes** and ensure they adhere to the project's coding standards.
4.  **Commit your changes** with a clear and concise message: `git commit -m "feat: Add new feature X"` or `fix: Resolve bug Y`.
5.  **Push your branch** to your forked repository: `git push origin feature/your-feature-name`.
6.  **Open a Pull Request** to the `main` branch of this repository, describing your changes in detail.

---

<p align="center">Built with ❤️</p>