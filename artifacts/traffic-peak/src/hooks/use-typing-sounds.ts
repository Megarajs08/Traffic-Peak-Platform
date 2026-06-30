import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "typing-peak:sound-enabled";

type Tone = {
	freq: number;
	duration: number;
	volume: number;
	type?: OscillatorType;
};

export function useTypingSounds() {
	const audioCtxRef = useRef<AudioContext | null>(null);
	const [enabled, setEnabled] = useState<boolean>(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved === null ? true : saved === "true";
	});

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, String(enabled));
	}, [enabled]);

	const ensureCtx = useCallback(() => {
		if (audioCtxRef.current) return audioCtxRef.current;
		const ctx = new AudioContext();
		audioCtxRef.current = ctx;
		return ctx;
	}, []);

	const playTone = useCallback(
		({ freq, duration, volume, type = "square" }: Tone) => {
			if (!enabled) return;

			const ctx = ensureCtx();
			if (ctx.state === "suspended") {
				void ctx.resume();
			}

			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = type;
			osc.frequency.setValueAtTime(freq, now);

			gain.gain.setValueAtTime(0.0001, now);
			gain.gain.exponentialRampToValueAtTime(volume, now + 0.004);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + duration + 0.01);
		},
		[enabled, ensureCtx]
	);

	const playKeySound = useCallback(
		(kind: "key" | "space" = "key") => {
			if (kind === "space") {
				playTone({ freq: 680, duration: 0.03, volume: 0.03, type: "triangle" });
				return;
			}
			playTone({ freq: 820, duration: 0.02, volume: 0.025, type: "square" });
		},
		[playTone]
	);

	const playErrorSound = useCallback(() => {
		playTone({ freq: 220, duration: 0.05, volume: 0.03, type: "sawtooth" });
	}, [playTone]);

	const playBackspaceSound = useCallback(() => {
		playTone({ freq: 420, duration: 0.025, volume: 0.02, type: "triangle" });
	}, [playTone]);

	return {
		enabled,
		setEnabled,
		playKeySound,
		playErrorSound,
		playBackspaceSound,
	};
}

