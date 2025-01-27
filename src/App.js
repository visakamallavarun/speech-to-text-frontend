import React, { useState } from "react";
import { Refine } from "@refinedev/core";
import { notificationProvider } from "@refinedev/antd";
import { ConfigProvider, theme, Button, Input, Card, Spin } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition , { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";

const App = () => {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const startListening = () => {
        if (browserSupportsSpeechRecognition) {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        } else {
            notificationProvider["error"]({
                message: "Speech Recognition",
                description: "Your browser does not support speech recognition."
            });
        }
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
        setText(transcript);
    };

    const sendTextToBackend = async () => {
        if (!text.trim()) {
            notificationProvider["warning"]({
                message: "Input Required",
                description: "Please provide some text to send."
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/speech", { content: text });
            notificationProvider["success"]({
                message: "Success",
                description: response.data.message || "Text sent successfully!"
            });
        } catch (error) {
            notificationProvider["error"]({
                message: "Error",
                description: error.response?.data?.message || "Failed to send text to the backend."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
            <Refine notificationProvider={notificationProvider}>
                <div className="p-4">
                    <Card title="Speech to Text" bordered={false} className="w-full max-w-lg mx-auto">
                        <Input.TextArea
                            rows={4}
                            value={listening ? transcript : text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Your transcribed text will appear here."
                            disabled={listening}
                        />
                        <div className="flex justify-between mt-4">
                            <Button
                                type="primary"
                                icon={<AudioOutlined />}
                                onClick={startListening}
                                disabled={listening}
                            >
                                Start Listening
                            </Button>
                            <Button
                                onClick={stopListening}
                                disabled={!listening}
                            >
                                Stop Listening
                            </Button>
                        </div>
                        <Button
                            className="mt-4 w-full"
                            type="primary"
                            loading={isLoading}
                            onClick={sendTextToBackend}
                        >
                            Send to Backend
                        </Button>
                    </Card>
                </div>
            </Refine>
        </ConfigProvider>
    );
};

export default App;
