import React, { useState } from "react";
import { Refine } from "@refinedev/core";
import { notificationProvider } from "@refinedev/antd";
import { ConfigProvider, theme, Button, Input, Card, Typography, Space } from "antd";
import { AudioOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import SpeechRecognition , { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";

const { Title, Text } = Typography;

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
            notificationProvider.open({
                type: "error",
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
            notificationProvider.open({
                type: "warning",
                message: "Input Required",
                description: "Please provide some text to send."
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/speech", { content: text });
            notificationProvider.open({
                type: "success",
                message: "Success",
                description: response.data.message || "Text sent successfully!"
            });
        } catch (error) {
            notificationProvider.open({
                type: "error",
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
                <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                    <Card
                        className="shadow-lg rounded-xl max-w-2xl w-full"
                        bodyStyle={{ padding: "24px 32px" }}
                    >
                        <Space direction="vertical" size="large" className="w-full">
                            <Title level={3} className="text-center text-blue-600">Speech to Text</Title>
                            <Text type="secondary" className="text-center">
                                Convert your speech to text and send it to the backend effortlessly.
                            </Text>
                            <Input.TextArea
                                rows={6}
                                value={listening ? transcript : text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Your transcribed text will appear here."
                                disabled={listening}
                                className="rounded-lg border-gray-300 shadow-sm focus:ring focus:ring-blue-200"
                            />
                            <div className="flex justify-between gap-4">
                                <Button
                                    type="primary"
                                    icon={<AudioOutlined />}
                                    onClick={startListening}
                                    disabled={listening}
                                    className="w-full"
                                >
                                    Start Listening
                                </Button>
                                <Button
                                    type="default"
                                    icon={<StopOutlined />}
                                    onClick={stopListening}
                                    disabled={!listening}
                                    className="w-full"
                                >
                                    Stop Listening
                                </Button>
                            </div>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                loading={isLoading}
                                onClick={sendTextToBackend}
                                className="w-full bg-blue-600 hover:bg-blue-700 border-none"
                            >
                                Send to Backend
                            </Button>
                        </Space>
                    </Card>
                </div>
            </Refine>
        </ConfigProvider>
    );
};

export default App;
