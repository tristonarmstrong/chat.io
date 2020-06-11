import React from 'react'
import Webcam from 'react-webcam'


const Cam = (props) => {


    const videoConstraints = {
        width: 200,
        height: 200,
        facingMode: "user"
    };

        const webcamRef = React.useRef(null);
        const mediaRecorderRef = React.useRef
        const [capturing, setCapturing] = React.useState(false);
        const [recordedChunks, setRecordedChunks] = React.useState([]);

        const handleStartCaptureClick = React.useCallback(()=>{
            setCapturing(true)
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: 'video/webm'
            })
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                handleDataAvailable
              )
              mediaRecorderRef.current.start();
        }, [webcamRef, setCapturing, mediaRecorderRef])

        const handleDataAvailable = React.useCallback(
            ({ data }) => {
              if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
              }
            },
            [setRecordedChunks]
          );

          const handleStopCaptureClick = React.useCallback(() => {
            mediaRecorderRef.current.stop();
            setCapturing(false);
          }, [mediaRecorderRef, webcamRef, setCapturing]);
        
          const handleDownload = React.useCallback(() => {
            if (recordedChunks.length) {
              const blob = new Blob(recordedChunks, {
                type: "video/webm"
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              document.body.appendChild(a);
              a.style = "display: none";
              a.href = url;
              a.download = "react-webcam-stream-capture.webm";
              a.click();
              window.URL.revokeObjectURL(url);
              setRecordedChunks([]);
            }
          }, [recordedChunks]);

        // props.method(imageSrc)
        return (
            <>
                <Webcam
                    audio={true}
                    height={200}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={200}
                    videoConstraints={videoConstraints}
                />
                {capturing ? (
                    <button onClick={handleStopCaptureClick}>Stop Capture</button>
                ) : (
                        <button onClick={handleStartCaptureClick}>Start Capture</button>
                    )}
                {recordedChunks.length > 0 && (
                    <button onClick={handleDownload}>Download</button>
                )}
            </>
        )
}

export default Cam