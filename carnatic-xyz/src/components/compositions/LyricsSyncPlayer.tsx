"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export interface LyricLine {
	time: number;
	text: string;
}

interface LyricsSyncPlayerProps {
	audioUrl: string;
	lyrics: LyricLine[];
}

export function LyricsSyncPlayer({ audioUrl, lyrics }: LyricsSyncPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentLineIndex, setCurrentLineIndex] = useState(0);
	const [playbackRate, setPlaybackRate] = useState(1);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);
		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);
		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
		};
	}, []);

	useEffect(() => {
		const index = lyrics.findIndex((line, i) => {
			const next = lyrics[i + 1];
			return (
				currentTime >= line.time &&
				(!next || currentTime < next.time)
			);
		});
		if (index !== -1) setCurrentLineIndex(index);
	}, [currentTime, lyrics]);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) audio.pause();
		else audio.play();
		setIsPlaying(!isPlaying);
	};

	const seekToLine = (index: number) => {
		const audio = audioRef.current;
		if (!audio || !lyrics[index]) return;
		audio.currentTime = lyrics[index].time;
	};

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, "0")}`;
	};

	if (!audioUrl) {
		return (
			<p className="text-muted-foreground text-sm">
				No audio available for this composition.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			<audio ref={audioRef} src={audioUrl} />
			<div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border p-4">
				{lyrics.map((line, index) => (
					<div
						key={index}
						role="button"
						tabIndex={0}
						onClick={() => seekToLine(index)}
						onKeyDown={(e) =>
							e.key === "Enter" && seekToLine(index)
						}
						className={`cursor-pointer rounded p-2 transition-colors ${
							index === currentLineIndex
								? "bg-primary/10 font-semibold"
								: "hover:bg-muted"
						}`}
					>
						{line.text}
					</div>
				))}
			</div>
			<div className="space-y-3">
				<Slider
					value={[currentTime]}
					max={duration || 100}
					step={0.1}
					onValueChange={(v) => {
						const audio = audioRef.current;
						if (audio) audio.currentTime = v[0];
					}}
				/>
				<div className="flex justify-between text-muted-foreground text-sm">
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
				<div className="flex items-center justify-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							const audio = audioRef.current;
							if (audio) audio.currentTime -= 10;
						}}
					>
						<SkipBack className="size-4" />
					</Button>
					<Button
						size="icon"
						className="size-12"
						onClick={togglePlay}
					>
						{isPlaying ? (
							<Pause className="size-5" />
						) : (
							<Play className="size-5" />
						)}
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							const audio = audioRef.current;
							if (audio) audio.currentTime += 10;
						}}
					>
						<SkipForward className="size-4" />
					</Button>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-2">
					<span className="text-muted-foreground text-sm">Speed:</span>
					{[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
						<Button
							key={speed}
							variant={playbackRate === speed ? "default" : "outline"}
							size="sm"
							onClick={() => {
								const audio = audioRef.current;
								if (audio) {
									audio.playbackRate = speed;
									setPlaybackRate(speed);
								}
							}}
						>
							{speed}x
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
