"use client";

import { useCallback, useRef, useEffect, useState } from "react";

// Ses dosyaları yolları
const SOUNDS = {
    correct: "/sounds/correct.wav",
    wrong: "/sounds/wrong.wav",
    click: "/sounds/click.wav",
    levelUp: "/sounds/level-up.wav",
    countdown: "/sounds/countdown.wav",
} as const;

type SoundName = keyof typeof SOUNDS;

// Ses ayarları için localStorage key
const SOUND_ENABLED_KEY = "laiba-sound-enabled";

export function useSound() {
    const audioRefs = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
    const [soundEnabled, setSoundEnabled] = useState(true);

    // İlk yüklemede localStorage'dan oku
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(SOUND_ENABLED_KEY);
            if (saved !== null) {
                setSoundEnabled(saved === "true");
            }
        }
    }, []);

    // Ses dosyalarını önceden yükle
    useEffect(() => {
        if (typeof window === "undefined") return;

        Object.entries(SOUNDS).forEach(([name, path]) => {
            const audio = new Audio(path);
            audio.preload = "auto";
            audio.volume = 0.5;
            audioRefs.current.set(name as SoundName, audio);
        });

        return () => {
            audioRefs.current.forEach((audio) => {
                audio.pause();
                audio.src = "";
            });
            audioRefs.current.clear();
        };
    }, []);

    // Ses çal
    const play = useCallback((name: SoundName, volume: number = 0.5) => {
        if (!soundEnabled) return;

        const audio = audioRefs.current.get(name);
        if (audio) {
            audio.currentTime = 0;
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.play().catch(() => {
                // Autoplay policy hatası - sessizce geç
            });
        }
    }, [soundEnabled]);

    // Ses ayarını değiştir
    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => {
            const newValue = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
            }
            return newValue;
        });
    }, []);

    // Convenience metodları
    const playCorrect = useCallback(() => play("correct", 0.6), [play]);
    const playWrong = useCallback(() => play("wrong", 0.5), [play]);
    const playClick = useCallback(() => play("click", 0.3), [play]);
    const playLevelUp = useCallback(() => play("levelUp", 0.7), [play]);
    const playCountdown = useCallback(() => play("countdown", 0.4), [play]);

    return {
        play,
        playCorrect,
        playWrong,
        playClick,
        playLevelUp,
        playCountdown,
        soundEnabled,
        toggleSound,
    };
}
