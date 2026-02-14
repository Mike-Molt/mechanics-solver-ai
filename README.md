# 🔧 Mechanics Solver AI

A mobile app that solves Engineering Mechanics problems using AI. Built with React Native and Expo.

## About

Mechanics Solver AI helps engineering students solve mechanics problems by sending questions to an open-source AI model (Qwen3-235B) via Hugging Face's inference API. The AI has been shown to be correct 93% of the time on statics problems.
You can view and use a website implementation of this app at: [Statics and Mechanics Solver AI](https://sites.google.com/view/staticssolverai). If you like it this repo allows you to build and deploy it on your own personal device.
From time to time you may need to change the provider or model as Hugging Face occasionally deprecates these. Note that if you change models you would then need to verify the model is smart enough to solve these problems (eg see [YouTube Link](https://www.youtube.com/watch?v=SNaTuYVLVXs)). You can download the dataset from [Hugging Face](https://huggingface.co/datasets/mikemolt/staticsmechanics).

## Features

- 🎯 **100 Example Questions** - Covers 14 topics
- ✏️ **Submit Your Own Questions** - Enter any mechanics problem in text format
- 🤖 **Powered by Qwen3-235B** - State-of-the-art open-source reasoning model
- 🔒 **Secure API Key Storage** - Your Hugging Face API key is stored locally on your device
- 📱 **Cross-Platform** - Works on Android and iOS

## Topics Covered

1. Stress
2. Strain
3. Mechanical properties
4. Axial load
5. Torsion
6. Bending
7. Transverse shear
8. Combined loadings
9. Stress transformation
10. Strain transformation
11. Design of beams and shafts
12. Beam deflections
13. Buckling
14. Energy methods

## Getting Started

### Prerequisites

- Node.js installed
- Expo CLI (`npm install -g expo-cli`)
- A free Hugging Face account and API key from https://huggingface.co/

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/Mike-Molt/mechanics-solver-ai.git
   cd mechanics-solver-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the app
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go app on your phone

## Usage

1. Open the app and enter your Hugging Face API key
2. Choose to select an example question or submit your own
3. For your own questions:
   - Use text-only format
   - State units (imperial or metric)
   - Use positive x-axis right, positive y-axis up
4. Wait for the AI to solve (may take a few minutes for complex problems)
5. View the step-by-step solution and final answer

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **Axios** - HTTP client
- **Expo Secure Store** - Encrypted local storage
- **Hugging Face Inference API** - AI model hosting
- **Qwen3-235B-A22B-Thinking-2507** - Large language model

## How It Works

The app sends your question to Hugging Face's inference API, which routes it to a provider running the Qwen3-235B model. The model "thinks" through the problem step-by-step and returns:
- 4 key solution steps
- The final answer with units
- Reaction forces (if applicable)

Streaming is used to prevent server timeouts during long calculations.

## Accuracy

Based on testing, the AI correctly solves approximately 93% of statics problems. See this video for more details: [YouTube Link](https://www.youtube.com/watch?v=SNaTuYVLVXs)

## Privacy

- Your API key is stored locally on your device only
- Questions are sent to Hugging Face for processing but are not stored
- No personal data is collected

See [Privacy Policy](privacy-policy.html) for full details.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the inference API
- [Qwen Team](https://github.com/QwenLM/Qwen) for the amazing open-source model
- Engineering students everywhere struggling with mechanics 💪

## Contact

If you have questions or suggestions, feel free to open an issue or reach out.

---

⭐ If this app helped you, please consider giving it a star!
