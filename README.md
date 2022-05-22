# Scribe
*Simplify lectures with Scribe, an audio transcription and summarization app!*

Taking notes in class is hard. But with Scribe, you can sit back and focus on the lecture; let us do the transcribing and summarizing. Get accurate transcriptions of everything said and save time studying with our automatically-generated summaries of the important bits and key words.

## Setup
To run this application, complete the following steps in your preferred IDE:
1. Clone the repository and change into the appropriate directory:
```
git clone https://github.com/zhangjuliet/Scribe.git
cd scribe
```
2. Install node dependencies:
```
npm install
```
3. Replace process.env.REACT_APP_AAI_API_KEY in App.js with your AssemblyAI API key.
```
...
  authorization: <your_API_key>
...
```
4. Run the app!
```
npm start
```

## Credits
Created by Juliet Zhang for Venus Hacks 2022.
Used AssemblyAI API and [tutorials](https://www.assemblyai.com/blog/tag/tutorials/).
