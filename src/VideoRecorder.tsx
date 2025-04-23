import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  videoBitsPerSecond?: number;
  mimeType?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  videoBitsPerSecond = 1_000_000, // 1 Mbps default
  mimeType = "video/webm", // webm is more widely supported for compression
}) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const startRecording = () => {
    setRecordedChunks([]);
    setVideoUrl(null);
    const stream = webcamRef.current?.stream as MediaStream;
    if (!stream) return;
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType,
      // videoBitsPerSecond,
    });
    mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }
  };

  const handleDataAvailable = async ({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
      setVideoUrl(URL.createObjectURL(data));
      onRecordingComplete?.(data);
    }
  };

  React.useEffect(() => {
    if (!capturing && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: mimeType });
      setVideoUrl(URL.createObjectURL(blob));
      onRecordingComplete?.(blob);
    }
    // eslint-disable-next-line
  }, [capturing, recordedChunks]);

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Webcam
        audio={true}
        ref={webcamRef}
        mirrored={true}
        muted={true}
        style={{ borderRadius: 16, width: "100%" }}
      />
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        {!capturing ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
      {videoUrl && (
        <div style={{ marginTop: 16 }}>
          <video src={videoUrl} controls style={{ width: "100%" }} />
          <a href={videoUrl} download="recorded-video.webm">
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder; 