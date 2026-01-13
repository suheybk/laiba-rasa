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

// Arka plan müzikleri
const BG_MUSIC = {
    dungeon: "/sounds/dungeon-bg.mp3",
    arena: "/sounds/arena-bg.mp3",
} as const;

type SoundName = keyof typeof SOUNDS;
type BgMusicName = keyof typeof BG_MUSIC;

// Ses ayarları için localStorage keys
const SOUND_ENABLED_KEY = "laiba-sound-enabled";
const MUSIC_ENABLED_KEY = "laiba-music-enabled";

export function useSound() {
    const audioRefs = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [currentBgMusic, setCurrentBgMusic] = useState<BgMusicName | null>(null);

    // İlk yüklemede localStorage'dan oku
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedSound = localStorage.getItem(SOUND_ENABLED_KEY);
            const savedMusic = localStorage.getItem(MUSIC_ENABLED_KEY);
            if (savedSound !== null) setSoundEnabled(savedSound === "true");
            if (savedMusic !== null) setMusicEnabled(savedMusic === "true");
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
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current = null;
            }
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

    // Arka plan müziği çal
    const playBgMusic = useCallback((name: BgMusicName, volume: number = 0.3) => {
        if (!musicEnabled) return;

        // Eğer aynı müzik zaten çalıyorsa, tekrar başlatma
        if (currentBgMusic === name && bgMusicRef.current && !bgMusicRef.current.paused) {
            return;
        }

        // Önceki müziği durdur
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
        }

        const audio = new Audio(BG_MUSIC[name]);
        audio.loop = true;
        audio.volume = 0; // Fade-in için 0'dan başla

        audio.play().then(() => {
            // Fade in
            let currentVol = 0;
            const fadeIn = setInterval(() => {
                currentVol += 0.02;
                if (currentVol >= volume) {
                    audio.volume = volume;
                    clearInterval(fadeIn);
                } else {
                    audio.volume = currentVol;
                }
            }, 50);
        }).catch(() => {
            // Autoplay policy
        });

        bgMusicRef.current = audio;
        setCurrentBgMusic(name);
    }, [musicEnabled, currentBgMusic]);

    // Arka plan müziğini durdur
    const stopBgMusic = useCallback(() => {
        if (bgMusicRef.current) {
            // Fade out
            const audio = bgMusicRef.current;
            let volume = audio.volume;
            const fadeOut = setInterval(() => {
                volume -= 0.02;
                if (volume <= 0) {
                    audio.pause();
                    audio.currentTime = 0;
                    clearInterval(fadeOut);
                    bgMusicRef.current = null;
                    setCurrentBgMusic(null);
                } else {
                    audio.volume = volume;
                }
            }, 50);
        }
    }, []);

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

    // Müzik ayarını değiştir
    const toggleMusic = useCallback(() => {
        setMusicEnabled((prev) => {
            const newValue = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem(MUSIC_ENABLED_KEY, String(newValue));
            }
            if (!newValue && bgMusicRef.current) {
                bgMusicRef.current.pause();
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
        playBgMusic,
        stopBgMusic,
        soundEnabled,
        musicEnabled,
        toggleSound,
        toggleMusic,
        currentBgMusic,
    };
}

