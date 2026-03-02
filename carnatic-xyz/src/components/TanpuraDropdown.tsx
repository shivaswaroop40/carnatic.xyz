"use client";

import { useState, useRef, useEffect } from "react";
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
import { ChevronDown } from "lucide-react";

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const BASE_FREQ: Record<string, number> = {
	C: 261.63, "C#": 277.18, D: 293.66, "D#": 311.13, E: 329.63,
	F: 349.23, "F#": 369.99, G: 392, "G#": 415.3, A: 440, "A#": 466.16, B: 493.88,
};

function getSaHz(pitch: string): number {
	return BASE_FREQ[pitch] ?? 261.63;
}

function getThreeStringFrequencies(pitch: string): [number, number, number] {
	const saMadhya = getSaHz(pitch);
	const paMandra = (saMadhya / 2) * Math.pow(2, 7 / 12);
	const saTara = saMadhya * 2;
	return [paMandra, saMadhya, saTara];
}

export function TanpuraDropdown() {
	const [open, setOpen] = useState(false);
	const [pitch, setPitch] = useState("C");
	const [volume, setVolume] = useState(0.7);
	const [tone, setTone] = useState<"violin" | "tambura">("tambura");
	const [playing, setPlaying] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const ctxRef = useRef<AudioContext | null>(null);
	const osc1Ref = useRef<OscillatorNode | null>(null);
	const osc2Ref = useRef<OscillatorNode | null>(null);
	const osc3Ref = useRef<OscillatorNode | null>(null);
	const gainRef = useRef<GainNode | null>(null);
	const filterRef = useRef<BiquadFilterNode | null>(null);

	// Close on click outside
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (
				panelRef.current?.contains(e.target as Node) ||
				buttonRef.current?.contains(e.target as Node)
			) return;
			setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open]);

	// When tone changes while playing, restart
	useEffect(() => {
		if (!playing) return;
		stop(true);
		start();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only when tone changes
	}, [tone]);

	// When pitch or volume change while playing, update oscillators and gain
	useEffect(() => {
		if (!playing || !ctxRef.current || !gainRef.current) return;
		const [f1, f2, f3] = getThreeStringFrequencies(pitch);
		if (osc1Ref.current) osc1Ref.current.frequency.value = f1;
		if (osc2Ref.current) osc2Ref.current.frequency.value = f2;
		if (osc3Ref.current) osc3Ref.current.frequency.value = f3;
		gainRef.current.gain.value = volume * 0.3;
	}, [pitch, volume, playing]);

	useEffect(() => {
		return () => {
			osc1Ref.current?.stop();
			osc2Ref.current?.stop();
			osc3Ref.current?.stop();
			ctxRef.current?.close();
		};
	}, []);

	const start = () => {
		if (playing && ctxRef.current) return;
		const ctx = new AudioContext();
		ctxRef.current = ctx;
		const [f1, f2, f3] = getThreeStringFrequencies(pitch);
		const gain = ctx.createGain();
		gain.gain.value = volume * 0.3;
		gainRef.current = gain;

		const isViolin = tone === "violin";
		if (isViolin) {
			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 1400;
			filter.Q.value = 0.6;
			filter.connect(ctx.destination);
			gain.connect(filter);
			filterRef.current = filter;
		} else {
			gain.connect(ctx.destination);
			filterRef.current = null;
		}

		const waveType = isViolin ? "sawtooth" : "sine";
		const osc1 = ctx.createOscillator();
		osc1.type = waveType;
		osc1.frequency.value = f1;
		osc1.connect(gain);
		osc1.start();
		osc1Ref.current = osc1;

		const osc2 = ctx.createOscillator();
		osc2.type = waveType;
		osc2.frequency.value = f2;
		osc2.connect(gain);
		osc2.start();
		osc2Ref.current = osc2;

		const osc3 = ctx.createOscillator();
		osc3.type = waveType;
		osc3.frequency.value = f3;
		osc3.connect(gain);
		osc3.start();
		osc3Ref.current = osc3;

		setPlaying(true);
	};

	const stop = (skipSetPlaying?: boolean) => {
		if (!playing && !skipSetPlaying) return;
		osc1Ref.current?.stop();
		osc2Ref.current?.stop();
		osc3Ref.current?.stop();
		osc1Ref.current = null;
		osc2Ref.current = null;
		osc3Ref.current = null;
		ctxRef.current?.close();
		ctxRef.current = null;
		gainRef.current = null;
		filterRef.current = null;
		if (!skipSetPlaying) setPlaying(false);
	};

	const togglePlay = () => {
		if (playing) stop();
		else start();
	};

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`text-sm font-medium transition-colors flex items-center gap-1 rounded-md px-2 py-1.5 ${
					open ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"
				}`}
				aria-expanded={open}
				aria-haspopup="true"
			>
				Tanpura
				<ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
			</button>
			{open && (
				<div
					ref={panelRef}
					className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-border bg-background p-4 shadow-lg"
					role="dialog"
					aria-label="Shruti / Tanpura"
				>
					<p className="text-muted-foreground mb-3 text-xs">
						Pa (Mandra) · Sa (Madhya) · Sa (Tara). Set tonic and tone.
					</p>
					<div className="space-y-4">
						<div>
							<Label className="text-xs">Tone</Label>
							<Select
								value={tone}
								onValueChange={(v) => setTone(v as "violin" | "tambura")}
							>
								<SelectTrigger className="mt-1 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="tambura">Tambura</SelectItem>
									<SelectItem value="violin">Violin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label className="text-xs">Scale / Tonic (Sa)</Label>
							<Select value={pitch} onValueChange={setPitch}>
								<SelectTrigger className="mt-1 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PITCHES.map((p) => (
										<SelectItem key={p} value={p}>{p}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label className="text-xs">Volume</Label>
							<Slider
								className="mt-1"
								value={[volume]}
								max={1}
								step={0.05}
								onValueChange={(v) => {
									setVolume(v[0]);
									if (gainRef.current) gainRef.current.gain.value = v[0] * 0.3;
								}}
							/>
						</div>
						<Button className="w-full" size="sm" onClick={togglePlay}>
							{playing ? "Stop" : "Play"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
