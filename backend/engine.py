import random
import time
import asyncio

class MusicEngine:
    def __init__(self):
        # Default configuration
        self.tempo = 120  # BPM
        self.scale = "C_major"
        self.complexity = 5  # 1 to 10
        self.running = False

        # Define some basic scales
        self.scales = {
            "C_major": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
            "A_minor": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
            "Pentatonic": ["C4", "D4", "E4", "G4", "A4", "C5"]
        }

        # Duration choices
        self.durations = ["16n", "8n", "4n", "2n"]
        self.mutate_trigger = False

    def update_params(self, params: dict):
        if "tempo" in params:
            self.tempo = params["tempo"]
        if "scale" in params and params["scale"] in self.scales:
            self.scale = params["scale"]
        if "complexity" in params:
            self.complexity = params["complexity"]

    def trigger_mutate(self):
        """Triggers a momentary mutation in the sequence."""
        self.mutate_trigger = True

    async def generate_loop(self, broadcast_callback):
        self.running = True

        while self.running:
            # Calculate sleep time based on tempo (assuming 4 beats per bar, simple model)
            beat_duration = 60.0 / self.tempo

            # Use complexity to decide note density and duration
            # Higher complexity = shorter durations, more jumps
            notes_in_scale = self.scales[self.scale]

            # Simple random walk/Markov-ish approach for next note
            if self.mutate_trigger:
                # Mutation: Random note from a potentially different octave or off-scale
                all_notes = [n for scale_notes in self.scales.values() for n in scale_notes]
                note = random.choice(all_notes)
                duration = "16n" # fast burst
                sleep_time = beat_duration / 8 # super fast
                self.mutate_trigger = False # Reset trigger after one burst
                self._just_mutated = True
            else:
                note = random.choice(notes_in_scale)

            # Duration based on complexity
            if not getattr(self, '_just_mutated', False):
                if self.complexity > 7:
                    duration = random.choice(["16n", "8n"])
                    sleep_time = beat_duration / 4  # Roughly 16th note
                elif self.complexity > 4:
                    duration = random.choice(["8n", "4n"])
                    sleep_time = beat_duration / 2  # Roughly 8th note
                else:
                    duration = random.choice(["4n", "2n"])
                    sleep_time = beat_duration  # Roughly quarter note
            else:
                self._just_mutated = False # reset the flag for next iteration

            event = {
                "type": "note",
                "note": note,
                "duration": duration,
                "velocity": random.uniform(0.5, 0.9),
                "timestamp": time.time()
            }

            await broadcast_callback(event)

            # Wait for next generation step
            await asyncio.sleep(sleep_time)

    def stop(self):
        self.running = False
