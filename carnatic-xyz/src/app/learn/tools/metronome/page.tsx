"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const TALAS = [
	{ name: "Adi", beats: 8 },
	{ name: "Rupaka", beats: 6 },
	{ name: "Khanda Chapu", beats: 5 },
	{ name: "Misra Chapu", beats: 7 },
	{ name: "Jhampa", beats: 10 },
];

export default function MetronomePage() {
	const [bpm, setBpm] = useState(80);
	const [tala, setTala] = useState("Adi");
	const [playing, setPlaying] = useState(false);
	const [beat, setBeat] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const audioRef = useRef<AudioContext | null>(null);
	const beatsRef = useRef(8);
	const periodMsRef = useRef(60000 / 80);

	const beats = TALAS.find((t) => t.name === tala)?.beats ?? 8;
	const periodMs = 60000 / bpm;
	beatsRef.current = beats;
	periodMsRef.current = periodMs;

	useEffect(() => {
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			audioRef.current?.close();
		};
	}, []);

	// When beats or BPM change while playing, restart the interval so the metronome adapts
	useEffect(() => {
		if (!playing) return;
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setBeat(0);
		playClick(true);
		intervalRef.current = setInterval(() => {
			setBeat((prev) => {
				const next = (prev + 1) % beatsRef.current;
				playClick(next === 0);
				return next;
			});
		}, periodMsRef.current);
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [playing, beats, periodMs]);

	const playClick = (accent: boolean) => {
		const ctx = audioRef.current ?? new AudioContext();
		audioRef.current = ctx;
		const osc = ctx.createOscillator();
		osc.frequency.value = accent ? 1000 : 800;
		osc.type = "sine";
		const gain = ctx.createGain();
		gain.gain.value = accent ? 0.15 : 0.08;
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.05);
	};

	const start = () => {
		if (playing) return;
		setPlaying(true);
		setBeat(0);
	};

	const stop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setPlaying(false);
		setBeat(0);
	};

	return (
		<div className="container mx-auto max-w-md py-8">
			<Link
				href="/learn"
				className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm underline"
			>
				← Learning Hub
			</Link>
			<h1 className="mb-6 text-3xl font-bold">Metronome</h1>
			<div className="space-y-6">
				<div>
					<Label>Tempo: {bpm} BPM</Label>
					<Slider
						className="mt-2"
						value={[bpm]}
						min={40}
						max={240}
						step={1}
						onValueChange={(v) => setBpm(v[0])}
					/>
				</div>
				<div>
					<Label>Tala</Label>
					<Select value={tala} onValueChange={setTala}>
						<SelectTrigger className="mt-1">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TALAS.map((t) => (
								<SelectItem key={t.name} value={t.name}>
									{t.name} ({t.beats} beats)
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex justify-center gap-2 py-4">
					{Array.from({ length: beats }, (_, i) => (
						<div
							key={i}
							className={`h-4 w-4 rounded-full ${
								i === beat ? "bg-primary" : "bg-muted"
							}`}
						/>
					))}
				</div>
				<Button className="w-full" size="lg" onClick={() => (playing ? stop() : start())}>
					{playing ? "Stop" : "Start"}
				</Button>
			</div>
		</div>
	);
}
