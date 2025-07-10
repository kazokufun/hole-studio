
import React, { useEffect, useRef, useCallback } from 'react';
import easingUtils from 'easing-utils';

const BackgroundAnimations = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animState = useRef<any>({
        ctx: null,
        discs: [],
        lines: [],
        particles: [],
        animationFrameId: null,
        rect: null,
        render: null,
        startDisc: null,
        endDisc: null,
        clip: null,
        linesCanvas: null,
        particleArea: null,
    });

    const css = `
        .bg-anim-container {
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #141414;
        }
        .bg-anim-container:before {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 2;
            display: block;
            width: 150%;
            height: 140%;
            background: radial-gradient(ellipse at 50% 55%, transparent 10%, black 50%);
            transform: translate3d(-50%, -50%, 0);
            content: "";
        }
        .bg-anim-container:after {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 5;
            display: block;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at 50% 75%, #a900ff 20%, transparent 75%);
            mix-blend-mode: overlay;
            transform: translate3d(-50%, -50%, 0);
            content: "";
        }
        @keyframes aura-glow {
            0% { background-position: 0 100%; }
            100% { background-position: 0 300%; }
        }
        .bg-anim-container .aura {
            position: absolute;
            top: -71.5%;
            left: 50%;
            z-index: 3;
            width: 30%;
            height: 140%;
            background: linear-gradient(20deg, #00f8f1, #ffbd1e20 16.5%, #fe848f 33%, #fe848f20 49.5%, #00f8f1 66%, #00f8f160 85.5%, #ffbd1e 100%) 0 100% / 100% 200%;
            border-radius: 0 0 100% 100%;
            filter: blur(50px);
            mix-blend-mode: plus-lighter;
            opacity: 0.75;
            transform: translate3d(-50%, 0, 0);
            animation: aura-glow 5s infinite linear;
        }
        .bg-anim-container .overlay {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(transparent, transparent 1px, white 1px, white 2px);
            mix-blend-mode: overlay;
            opacity: 0.5;
        }
        .bg-anim-container .js-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;
    
    const tweenValue = useCallback((start: number, end: number, p: number, ease = '') => {
        const delta = end - start;
        const easeFnName = ease ? `ease${ease.charAt(0).toUpperCase()}${ease.slice(1)}` : 'linear';
        const easeFn = (easingUtils as any)[easeFnName] || easingUtils.linear;
        return start + delta * easeFn(p);
    }, []);

    const tweenDisc = useCallback((disc: any) => {
        const state = animState.current;
        if (!state.startDisc || !state.endDisc) return disc;
        disc.x = tweenValue(state.startDisc.x, state.endDisc.x, disc.p);
        disc.y = tweenValue(state.startDisc.y, state.endDisc.y, disc.p, "inExpo");
        disc.w = tweenValue(state.startDisc.w, state.endDisc.w, disc.p);
        disc.h = tweenValue(state.startDisc.h, state.endDisc.h, disc.p);
        return disc;
    }, [tweenValue]);
    
    useEffect(() => {
        const state = animState.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        state.ctx = canvas.getContext('2d');

        const initParticle = (start = false) => {
            const { particleArea } = state;
            const sx = particleArea.sx + particleArea.sw * Math.random();
            const ex = particleArea.ex + particleArea.ew * Math.random();
            const dx = ex - sx;
            const y = start ? particleArea.h * Math.random() : particleArea.h;
            const r = 0.5 + Math.random() * 4;
            const vy = 0.5 + Math.random();
            return { x: sx, sx, dx, y, vy, p: 0, r, c: `rgba(255, 255, 255, ${Math.random()})` };
        };

        const setParticles = () => {
            const { rect, clip } = state;
            if (!rect || !clip || !clip.disc) return;
            state.particles = [];
            state.particleArea = {
                sw: clip.disc.w * 0.5,
                ew: clip.disc.w * 2,
                h: rect.height * 0.85
            };
            state.particleArea.sx = (rect.width - state.particleArea.sw) / 2;
            state.particleArea.ex = (rect.width - state.particleArea.ew) / 2;
            for (let i = 0; i < 100; i++) {
                state.particles.push(initParticle(true));
            }
        };

        const setDiscs = () => {
            const { rect } = state;
            if (!rect) return;
            const { width, height } = rect;
            state.discs = [];
            state.startDisc = { x: width * 0.5, y: height * 0.45, w: width * 0.75, h: height * 0.7 };
            state.endDisc = { x: width * 0.5, y: height * 0.95, w: 0, h: 0 };
            let prevBottom = height;
            state.clip = {};
            for (let i = 0; i < 100; i++) {
                const p = i / 100;
                const disc = tweenDisc({ p });
                const bottom = disc.y + disc.h;
                if (bottom <= prevBottom) {
                    state.clip = { disc: { ...disc } };
                }
                prevBottom = bottom;
                state.discs.push(disc);
            }
            if (state.clip.disc) {
                const { disc } = state.clip;
                state.clip.path = new Path2D();
                state.clip.path.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
                state.clip.path.rect(disc.x - disc.w, 0, disc.w * 2, disc.y);
            }
        };
        
        const setLines = () => {
            const { rect, discs, clip, render } = state;
            if (!rect || !discs || !clip || !clip.path) return;
            const { width, height } = rect;
            state.lines = [];
            const totalLines = 100;
            const linesAngle = (Math.PI * 2) / totalLines;
            for (let i = 0; i < totalLines; i++) { state.lines.push([]); }

            discs.forEach((disc: any) => {
                for (let i = 0; i < totalLines; i++) {
                    const angle = i * linesAngle;
                    state.lines[i].push({ x: disc.x + Math.cos(angle) * disc.w, y: disc.y + Math.sin(angle) * disc.h });
                }
            });
            
            state.linesCanvas = new OffscreenCanvas(width * render.dpi, height * render.dpi);
            const ctx = state.linesCanvas.getContext("2d");
            ctx.scale(render.dpi, render.dpi);

            state.lines.forEach((line: any[]) => {
                let lineIsIn = false;
                for (let j = 1; j < line.length; j++) {
                    const p1 = line[j];
                    if (!lineIsIn && (ctx.isPointInPath(clip.path, p1.x, p1.y) || ctx.isPointInStroke(clip.path, p1.x, p1.y))) {
                        lineIsIn = true;
                    } else if (lineIsIn) {
                        ctx.clip(clip.path);
                    }
                    const p0 = line[j - 1];
                    ctx.beginPath();
                    ctx.moveTo(p0.x, p0.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.strokeStyle = "#444";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        };
        
        const drawDiscs = () => {
            const { ctx, startDisc, discs, clip } = state;
            if (!ctx || !startDisc || !discs || !clip || !clip.disc) return;
            ctx.strokeStyle = "#444"; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(startDisc.x, startDisc.y, startDisc.w, startDisc.h, 0, 0, Math.PI * 2);
            ctx.stroke();
            discs.forEach((disc: any, i: number) => {
                if (i % 5 !== 0) return;
                const shouldClip = disc.w < clip.disc.w - 5;
                if (shouldClip) {
                    ctx.save();
                    ctx.clip(clip.path);
                }
                ctx.beginPath();
                ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
                ctx.stroke();
                if (shouldClip) {
                    ctx.restore();
                }
            });
        };

        const drawLines = () => {
            const { ctx, linesCanvas, render } = state;
            if (!ctx || !linesCanvas) return;
            ctx.drawImage(linesCanvas, 0, 0, linesCanvas.width / render.dpi, linesCanvas.height / render.dpi);
        };
        
        const drawParticles = () => {
            const { ctx, particles, clip } = state;
            if (!ctx || !particles || !clip || !clip.path) return;
            ctx.save();
            ctx.clip(clip.path);
            particles.forEach((p: any) => {
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.rect(p.x, p.y, p.r, p.r);
                ctx.fill();
            });
            ctx.restore();
        };

        const moveDiscs = () => {
            state.discs.forEach((disc: any) => {
                disc.p = (disc.p + 0.001) % 1;
                tweenDisc(disc);
            });
        };

        const moveParticles = () => {
            if (!state.particles || !state.particleArea) return;
            state.particles.forEach((p: any) => {
                p.p = 1 - p.y / state.particleArea.h;
                p.x = p.sx + p.dx * p.p;
                p.y -= p.vy;
                if (p.y < 0) Object.assign(p, initParticle());
            });
        };
        
        const tick = () => {
            const { ctx, render } = state;
            if (!ctx || !canvas || !render) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(render.dpi, render.dpi);
            moveDiscs();
            moveParticles();
            drawDiscs();
            drawLines();
            drawParticles();
            ctx.restore();
            state.animationFrameId = requestAnimationFrame(tick);
        };
        
        const setSize = () => {
            state.rect = container.getBoundingClientRect();
            state.render = { width: state.rect.width, height: state.rect.height, dpi: window.devicePixelRatio };
            canvas.width = state.render.width * state.render.dpi;
            canvas.height = state.render.height * state.render.dpi;
        };
        
        const onResize = () => {
            setSize();
            setDiscs();
            setLines();
            setParticles();
        };

        setSize();
        setDiscs();
        setLines();
        setParticles();
        window.addEventListener('resize', onResize);
        state.animationFrameId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('resize', onResize);
            if (state.animationFrameId) {
                cancelAnimationFrame(state.animationFrameId);
            }
        };
    }, [tweenDisc]);

    return (
        <>
            <style>{css}</style>
            <div ref={containerRef} className="bg-anim-container">
                <canvas ref={canvasRef} className="js-canvas"></canvas>
                <div className="aura"></div>
                <div className="overlay"></div>
            </div>
        </>
    );
};

export default BackgroundAnimations;
