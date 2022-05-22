import MicRecorder from "mic-recorder-to-mp3";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

// Set AssemblyAI Axios Header
const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: process.env.REACT_APP_AAI_API_KEY,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

// Convert from milliseconds to more user-intuitive HH:MM:SS timestamps
function convert_ms(start_ms) {
  var hours = Math.floor((start_ms / 3600000) % 24).toFixed(0);
  var minutes = Math.floor((start_ms / 60000) % 60).toFixed(0);
  var seconds = ((start_ms / 1000) % 60).toFixed(0);
  if (hours > 0) {
    return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
  else {
    return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }
}

function testPrint(t) {
  console.log(t);
}

const App = () => {
  // Mic-Recorder-To-MP3
  const recorder = useRef(null); //Recorder
  const audioPlayer = useRef(null); //Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(null);

  useEffect(() => {
    //Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true);
    });
  };

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);
        setIsRecording(false);
        setAudioFile(file);
      })
      .catch((e) => console.log(e));
  };

  // AssemblyAI API

  // State variables
  const [uploadURL, setUploadURL] = useState("");
  const [transcriptID, setTranscriptID] = useState("");
  const [transcriptData, setTranscriptData] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Upload the Audio File and retrieve the Upload URL
  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err));
    }
  }, [audioFile]);

  // Submit the Upload URL to AssemblyAI and retrieve the Transcript ID
  const submitTranscriptionHandler = () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
        auto_chapters: true,
      })
      .then((res) => {
        setTranscriptID(res.data.id);

        checkStatusHandler();
      })
      .catch((err) => console.error(err));
  };

  // Check the status of the Transcript
  const checkStatusHandler = async () => {
    setIsLoading(true);
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        setTranscriptData(res.data);
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Periodically check the status of the Transcript
  useEffect(() => {
    const interval = setInterval(() => {
      if (transcriptData.status !== "completed" && isLoading) {
        checkStatusHandler();
      } else {
        setIsLoading(false);
        setTranscript(transcriptData.text);

        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div>
      <h1>scribe.</h1>
      <audio ref={audioPlayer} src={blobURL} controls="controls" />
      <div>
        <button disabled={isRecording} onClick={startRecording}>
          Start Recording
        </button>
        <button disabled={!isRecording} onClick={stopRecording}>
          Stop Recording
        </button>
        <br/>
        <button onClick={submitTranscriptionHandler}>Generate Results!</button>
      </div>
      {transcriptData.status === "completed" ? (
        <div>
          <h2>transcript</h2>
          <p>{transcript}</p>
          <h2>summary</h2>
          {transcriptData.chapters.map((chapter) => {
            return (
              <div>
                {testPrint(chapter)}
                <h3>{convert_ms(chapter.start)} - {convert_ms(chapter.end)}</h3>
                <p>{chapter.summary}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p>{transcriptData.status}</p>
      )}
    </div>
  );
};

export default App;
