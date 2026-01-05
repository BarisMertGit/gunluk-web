"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const moods = [
    { value: "happy", emoji: "😊", label: "Mutlu", color: "var(--mood-happy)" },
    { value: "excited", emoji: "🤩", label: "Heyecanlı", color: "var(--mood-excited)" },
    { value: "peaceful", emoji: "😌", label: "Huzurlu", color: "var(--mood-peaceful)" },
    { value: "grateful", emoji: "🙏", label: "Minnettar", color: "var(--mood-grateful)" },
    { value: "neutral", emoji: "😐", label: "Normal", color: "var(--mood-neutral)" },
    { value: "tired", emoji: "😴", label: "Yorgun", color: "var(--mood-tired)" },
    { value: "anxious", emoji: "😰", label: "Endişeli", color: "var(--mood-anxious)" },
    { value: "confused", emoji: "😕", label: "Kararsız", color: "var(--mood-confused)" },
    { value: "sad", emoji: "😢", label: "Üzgün", color: "var(--mood-sad)" },
    { value: "angry", emoji: "😠", label: "Kızgın", color: "var(--mood-angry)" },
];

export default function NewEntryPage() {
    const router = useRouter();
    const videoRef = useRef(null);
    const previewRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const [step, setStep] = useState(1);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: "",
        note: "",
        mood: "",
        moodIntensity: 5,
        tags: "",
        isPrivate: true,
    });

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 1280, height: 720 },
                audio: true,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Camera error:", error);
            alert("Kameraya erişilemedi. Lütfen tarayıcı izinlerini kontrol edin.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp9,opus",
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            setRecordedBlob(blob);
            setStep(2);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000);
        setIsRecording(true);
        setRecordingTime(0);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            stopCamera();
        }
    };

    const retakeVideo = () => {
        setRecordedBlob(null);
        setStep(1);
        startCamera();
    };

    const proceedToDetails = () => {
        setStep(3);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recordedBlob) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();

            formDataToSend.append("video", recordedBlob, "video.webm");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("note", formData.note);
            formDataToSend.append("mood", formData.mood);
            formDataToSend.append("mood_intensity", formData.moodIntensity.toString());
            formDataToSend.append("manual_tags", JSON.stringify(
                formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            ));
            formDataToSend.append("is_private", formData.isPrivate.toString());

            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 500);

            const response = await fetch("http://localhost:8000/api/entries/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            setTimeout(() => {
                router.push("/feed");
            }, 500);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Yükleme başarısız oldu. Lütfen tekrar deneyin.");
            setIsUploading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Step Indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
                {[1, 2, 3].map((s) => (
                    <div key={s} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "600",
                            backgroundColor: step >= s ? "var(--primary)" : "var(--bg-secondary)",
                            color: step >= s ? "var(--bg-primary)" : "var(--text-muted)"
                        }}>
                            {s}
                        </div>
                        {s < 3 && (
                            <div style={{
                                width: "64px",
                                height: "4px",
                                marginLeft: "0.5rem",
                                marginRight: "0.5rem",
                                borderRadius: "2px",
                                backgroundColor: step > s ? "var(--primary)" : "var(--bg-secondary)"
                            }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Recording */}
            {step === 1 && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ position: "relative", aspectRatio: "16/9", backgroundColor: "#000" }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                        />

                        {/* Recording indicator */}
                        {isRecording && (
                            <div style={{
                                position: "absolute",
                                top: "1rem",
                                left: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <div style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    backgroundColor: "#EF4444",
                                    animation: "pulse 1.5s ease-in-out infinite"
                                }} />
                                <span style={{ color: "#fff", fontFamily: "monospace" }}>{formatTime(recordingTime)}</span>
                            </div>
                        )}

                        {/* Controls */}
                        <div style={{
                            position: "absolute",
                            bottom: "1.5rem",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem"
                        }}>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`record-btn ${isRecording ? "recording" : ""}`}
                            >
                                {isRecording ? (
                                    <div style={{ width: "32px", height: "32px", backgroundColor: "#fff", borderRadius: "4px" }} />
                                ) : (
                                    <div style={{ width: "24px", height: "24px", backgroundColor: "#fff", borderRadius: "50%" }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: "1.5rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                            {isRecording ? "Kaydediliyor..." : "Günlüğünüzü Kaydedin"}
                        </h2>
                        <p style={{ color: "var(--text-secondary)" }}>
                            {isRecording ? "Durdurmak için butona tıklayın" : "Başlamak için kırmızı butona tıklayın"}
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && recordedBlob && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
                        <video
                            ref={previewRef}
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    </div>

                    <div style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", textAlign: "center", marginBottom: "1rem" }}>
                            Kaydı İnceleyin
                        </h2>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button onClick={retakeVideo} className="btn-secondary">
                                Tekrar Kaydet
                            </button>
                            <button onClick={proceedToDetails} className="btn-primary">
                                Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Video Preview */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
                            <video
                                src={recordedBlob ? URL.createObjectURL(recordedBlob) : ""}
                                controls
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </div>
                    </div>

                    {/* Mood Selection */}
                    <div className="card">
                        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "1rem" }}>
                            Bugün nasıl hissediyorsunuz?
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                            {moods.map((mood) => (
                                <button
                                    key={mood.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mood: mood.value })}
                                    style={{
                                        padding: "1rem",
                                        borderRadius: "0.75rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        border: formData.mood === mood.value ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                                        backgroundColor: formData.mood === mood.value ? mood.color : "var(--bg-secondary)",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem" }}>{mood.emoji}</span>
                                    <span style={{ fontSize: "0.75rem", color: formData.mood === mood.value ? "#fff" : "var(--text-secondary)" }}>
                                        {mood.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Mood Intensity */}
                        {formData.mood && (
                            <div style={{ marginTop: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                                    Yoğunluk: {formData.moodIntensity}/10
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.moodIntensity}
                                    onChange={(e) => setFormData({ ...formData, moodIntensity: parseInt(e.target.value) })}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                                Başlık (opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                placeholder="Bugün neler oldu?"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                                Not (opsiyonel)
                            </label>
                            <textarea
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                rows={3}
                                className="input"
                                style={{ resize: "none" }}
                                placeholder="Eklemek istediğiniz notlar..."
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                                Etiketler (virgülle ayırın)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="input"
                                placeholder="iş, aile, seyahat..."
                            />
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={formData.isPrivate}
                                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                            />
                            <span style={{ color: "var(--text-secondary)" }}>Bu kaydı gizli tut</span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>
                            Geri
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="btn-primary"
                            style={{ flex: 1, opacity: isUploading ? 0.5 : 1 }}
                        >
                            {isUploading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "20px", height: "20px" }}></div>
                                    Yükleniyor... {uploadProgress}%
                                </span>
                            ) : (
                                "Kaydet"
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
