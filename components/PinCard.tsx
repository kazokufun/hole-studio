
import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { unlockAudio } from '../services/audioService';

const CORRECT_PIN = "332211";

interface PinCardProps {
    onSuccess: () => void;
}

export const PinCard: React.FC<PinCardProps> = ({ onSuccess }) => {
    const [pin, setPin] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto-focus the first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
        if (value.length > 1) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Move to next input if a digit is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        if (pastedData.length === 6) {
            const newPin = pastedData.split('');
            setPin(newPin);
            inputRefs.current[5]?.focus();
        }
    };
    
    const handleSubmit = () => {
        // Unlock audio on the first significant user interaction.
        unlockAudio();

        const enteredPin = pin.join('');
        if (enteredPin === CORRECT_PIN) {
            setError('');
            onSuccess();
        } else {
            setError('Invalid PIN. Please try again.');
            setPin(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        }
    };
    
    const isPinComplete = pin.every(digit => digit !== '');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 font-mono text-white/90 p-4">
            <GlassCard className="p-8 w-full max-w-md relative border-cyan-500/50 flex flex-col items-center">
                <h2 className="text-2xl font-bold tracking-widest mb-2 text-cyan-300">ACCESS REQUIRED</h2>
                <p className="text-sm text-white/60 mb-8">
                    Please enter your 6-digit PIN to access the studio.
                </p>

                <div className="flex justify-center gap-2 md:gap-4 mb-6" onPaste={handlePaste}>
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => {
                                if (el) inputRefs.current[index] = el;
                            }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-black/30 rounded-lg border-2 
                                ${error ? 'border-red-500' : 'border-white/20'} 
                                focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all`}
                        />
                    ))}
                </div>
                
                {error && (
                    <p className="text-red-400 text-sm mb-6 animate-pulse">{error}</p>
                )}

                <ButtonAnimations onClick={handleSubmit} disabled={!isPinComplete}>
                    SUBMIT
                </ButtonAnimations>
            </GlassCard>
        </div>
    );
};
