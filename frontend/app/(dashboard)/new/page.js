"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const [step, setStep] = useState(1); // 1: Record, 2: Review, 3: Details
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

    // Start camera
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

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Recording timer
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

            // Simulate upload progress
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
        <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s
                                    ? "gradient-button text-white"
                                    : "bg-[var(--bg-card)] text-[var(--text-muted)]"
                                }`}
                        >
                            {s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`w-16 h-1 mx-2 rounded ${step > s ? "bg-[var(--primary-purple)]" : "bg-[var(--bg-card)]"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Recording */}
            {step === 1 && (
                <div className="glass-card overflow-hidden">
                    <div className="relative aspect-video bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />

                        {/* Recording indicator */}
                        {isRecording && (
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-white font-mono">{formatTime(recordingTime)}</span>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                                        ? "bg-red-500 animate-pulse-glow"
                                        : "gradient-button hover:scale-110"
                                    }`}
                            >
                                {isRecording ? (
                                    <div className="w-8 h-8 bg-white rounded-sm" />
                                ) : (
                                    <div className="w-6 h-6 bg-white rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 text-center">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {isRecording ? "Kaydediliyor..." : "Günlüğünüzü Kaydedin"}
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            {isRecording
                                ? "Durdurmak için butona tıklayın"
                                : "Başlamak için kırmızı butona tıklayın"}
                        </p>
                    </div>
                </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && recordedBlob && (
                <div className="glass-card overflow-hidden">
                    <div className="relative aspect-video bg-black">
                        <video
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 text-center">
                            Kaydı İnceleyin
                        </h2>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={retakeVideo}
                                className="px-6 py-3 rounded-xl bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white hover:bg-[var(--bg-card-hover)] transition-colors"
                            >
                                Tekrar Kaydet
                            </button>
                            <button
                                onClick={proceedToDetails}
                                className="gradient-button px-6 py-3 rounded-xl text-white font-semibold"
                            >
                                Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Preview */}
                    <div className="glass-card overflow-hidden">
                        <div className="aspect-video bg-black">
                            <video
                                src={recordedBlob ? URL.createObjectURL(recordedBlob) : ""}
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Mood Selection */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Bugün nasıl hissediyorsunuz?
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {moods.map((mood) => (
                                <button
                                    key={mood.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mood: mood.value })}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.mood === mood.value
                                            ? "ring-2 ring-white scale-105"
                                            : "hover:scale-105"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            formData.mood === mood.value
                                                ? mood.color
                                                : "var(--bg-dark)",
                                    }}
                                >
                                    <span className="text-2xl">{mood.emoji}</span>
                                    <span className="text-xs text-white">{mood.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Mood Intensity */}
                        {formData.mood && (
                            <div className="mt-6">
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                    Yoğunluk: {formData.moodIntensity}/10
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.moodIntensity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            moodIntensity: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="glass-card p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Başlık (opsiyonel)
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)]"
                                placeholder="Bugün neler oldu?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Not (opsiyonel)
                            </label>
                            <textarea
                                value={formData.note}
                                onChange={(e) =>
                                    setFormData({ ...formData, note: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)] resize-none"
                                placeholder="Eklemek istediğiniz notlar..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Etiketler (virgülle ayırın)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({ ...formData, tags: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-dark)] border border-[var(--glass-border)] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-purple)]"
                                placeholder="iş, aile, seyahat..."
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPrivate}
                                onChange={(e) =>
                                    setFormData({ ...formData, isPrivate: e.target.checked })
                                }
                                className="w-5 h-5 rounded border-[var(--glass-border)] bg-[var(--bg-dark)]"
                            />
                            <span className="text-[var(--text-secondary)]">
                                Bu kaydı gizli tut
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="flex-1 px-6 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-white hover:bg-[var(--bg-card-hover)] transition-colors"
                        >
                            Geri
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 gradient-button px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50"
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
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
